
"use strict";
const constructorToLambda = (constructor) => {
    return (...args) => new constructor(...args);
};
"use strict";
const impossible = (x) => {
    throw new Error('impossible');
};
const createUuid = () => {
    const letters = [];
    for (let i = 0; i < 20; i++) {
        const choice = Math.floor(Math.random() * 36);
        const letter = String.fromCharCode(choice < 10 ? (choice + '0'.charCodeAt(0)) : (choice - 10 + 'a'.charCodeAt(0)));
        letters.push(letter);
    }
    return letters.join('');
};
const reverseInPlace = (arr) => {
    for (let i = 0; i < Math.floor(arr.length / 2); i++) {
        const j = arr.length - i - 1;
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
};
const argmin = (args, transform, scoreFunc) => {
    let min = null;
    for (const arg of args) {
        const result = transform(arg);
        if (result === 'invalid')
            continue;
        const score = scoreFunc(result);
        if (min === null || score < min.score) {
            min = { arg, result, score };
        }
    }
    return min;
};
const areEq = (a, b) => a === b;
const Memo = (f, fingerprint) => {
    const s = {};
    return () => {
        if (typeof fingerprint !== 'undefined') {
            const print = fingerprint();
            if (typeof s.print === 'undefined'
                || print.length !== s.print.length
                || print.some((e, i) => e !== s.print[i])) {
                s.print = print;
                s.value = f();
                return s.value;
            }
        }
        if (typeof s.value === 'undefined') {
            s.value = f();
        }
        return s.value;
    };
};
;
const Refs = {
    of: (value, ...compareValues) => {
        const state = { value };
        const compare = compareValues.length === 1 ? compareValues[0] : undefined;
        return new RefImpl({
            get: () => state.value,
            set: (value) => {
                state.value = value;
            },
            compareValues: compare,
        });
    },
    mapDef: (ref, f) => ({
        get: () => f.to(ref.get()),
        set: (value) => ref.set(f.from(value)),
        compareValues: f.compareValues,
    }),
    reduce: (map, ...refs) => {
        const reduced = new RefImpl({
            get: () => map.to(refs.map(r => r.get())),
            set: (value) => {
                const values = map.from(value);
                for (let i = 0; i < refs.length; i++) {
                    const ref = refs[i];
                    const val = values[i];
                    ref.set(val);
                }
            },
            compareValues: map.compareValues,
        });
        for (const ref of refs) {
            reduced.upstream.add(ref);
            ref.downstream.add(reduced);
        }
        return reduced;
    },
    polling: (props, ...compareValues) => {
        const ref = Refs.of(props.poll(), ...compareValues);
        const state = { interval: 0 };
        state.interval = setInterval(() => {
            if (props.stopWhen()) {
                clearInterval(state.interval);
                return;
            }
            ref.set(props.poll());
        }, props.delayMillis);
        return ref;
    },
    negate: (ref) => ref.map({
        to: (v) => !v,
        from: (v) => !v,
    }),
    mapRo: (ref, f) => ({
        kind: 'ro',
        get: () => f(ref.get()),
        onChange: (l) => ref.onChange(v => l(f(v))),
        toString: () => `Ro(${f(ref.get())})`,
        map: (g) => Refs.mapRo(ref, (v) => g(f(v))),
    }),
    ofRo: (value) => ({
        kind: 'ro',
        get: () => value,
        onChange: _ => { },
        toString: () => `Ro(${value})`,
        map: f => Refs.ofRo(f(value)),
    }),
    ro: (ref) => {
        if (ref.kind === 'ro') {
            return ref;
        }
        const r = {};
        r.self = {
            kind: 'ro',
            get: () => ref.get(),
            onChange: l => ref.onChange(l),
            toString: () => `Ro(${ref.get()})`,
            map: f => Refs.mapRo(r.self, f),
        };
        return r.self;
    },
    memo: (ref, f) => {
        const initial = ref.get();
        const state = {
            value: initial,
            mapped: f(initial),
            valid: true,
        };
        ref.onChange(v => {
            state.value = v;
            state.valid = false;
        });
        state.self = {
            kind: 'ro',
            get: () => {
                if (!state.valid) {
                    state.mapped = f(state.value);
                    state.valid = true;
                }
                return state.mapped;
            },
            onChange: listen => ref.onChange(v => listen(state.valid ? state.mapped : state.self.get())),
            toString: () => `MemoRoRef(${state.self.get()})`,
            map: f => Refs.mapRo(state.self, f),
        };
        return state.self;
    },
    reduceRo: (map, ...refs) => {
        const get = () => {
            const u = (r) => r.get();
            return refs.map(u);
        };
        const r = {};
        r.self = {
            kind: 'ro',
            get: () => map(get()),
            onChange: (l) => {
                refs.forEach(r => r.onChange(_ => l(map(get()))));
            },
            toString: () => `Ro(${map(get())})`,
            map: (g) => Refs.mapRo(r.self, g),
        };
        return r.self;
    },
    memoReduce: (map, ...refs) => {
        const reduced = Refs.reduceRo(a => a, ...refs);
        const memoized = Refs.memo(reduced, arr => map(...arr));
        return memoized;
    },
    flatMapRo: (ref, f) => {
        const egg = Refs.mapRo(ref, f);
        const r = {};
        const yolkListener = (expectedYolk, listen) => {
            return value => {
                if (egg.get() === expectedYolk) {
                    listen(value);
                }
            };
        };
        r.self = {
            kind: 'ro',
            get: () => egg.get().get(),
            onChange: listen => {
                const yolk = egg.get();
                yolk.onChange(yolkListener(yolk, listen));
                egg.onChange(yolk => {
                    yolk.onChange(yolkListener(yolk, listen));
                    listen(yolk.get());
                });
            },
            toString: () => egg.get().toString(),
            map: g => Refs.mapRo(r.self, g),
        };
        return r.self;
    }
};
class RefImpl {
    constructor(def) {
        this.upstream = new Set();
        this.downstream = new Set();
        this.kind = 'rw';
        this.listeners = new Set();
        this._get = def.get;
        this._set = def.set;
        this.compareValues = def.compareValues;
    }
    get() {
        return this._get();
    }
    set(value) {
        if (this.eq(value)) {
            return;
        }
        this._set(value);
        this.fireUpdate({ value, kind: 'internal' });
    }
    map(f) {
        const mapped = new RefImpl(Refs.mapDef(this, f));
        mapped.upstream.add(this);
        this.downstream.add(mapped);
        return mapped;
    }
    eq(other) {
        const value = this.get();
        const cmp = this.compareValues;
        if (typeof cmp !== 'undefined') {
            return cmp(value, other);
        }
        if (typeof value.eq === 'function') {
            return value.eq(other);
        }
        return value === other;
    }
    onChange(listener) {
        this.listeners.add(listener);
    }
    toString() {
        const value = this.get();
        return `Ref(${typeof value}: ${value})`;
    }
    getUpdateValue(update) {
        if (update.kind === 'external') {
            return this.get();
        }
        return update.value;
    }
    fireUpdate(update) {
        if (update.kind === 'external' && update.source === this) {
            // This shouldn't be possible.
            return;
        }
        const value = this.getUpdateValue(update);
        for (const listener of this.listeners) {
            listener(value);
        }
        const event = {
            kind: 'external',
            source: this,
        };
        if (update.kind === 'internal' || update.direction === 'up') {
            for (const ref of this.upstream) {
                ref.fireUpdate(Object.assign({ direction: 'up' }, event));
            }
        }
        if (update.kind === 'internal' || update.direction === 'down') {
            for (const ref of this.downstream) {
                ref.fireUpdate(Object.assign({ direction: 'down' }, event));
            }
        }
    }
}
class DefaultMap {
    constructor(defaultValue) {
        this.defaultValue = defaultValue;
        this.map = new Map();
    }
    set(key, value) {
        this.map.set(key, value);
    }
    get(key) {
        if (!this.map.has(key)) {
            this.map.set(key, this.defaultValue());
        }
        return this.map.get(key);
    }
    has(key) {
        return this.map.has(key);
    }
    delete(key) {
        return this.map.delete(key);
    }
    keys() {
        return new Set(this.map.keys());
    }
    values() {
        return Array.from(this.map.values());
    }
    clear() {
        this.map.clear();
    }
    get size() {
        return this.map.size;
    }
}
class Counter extends DefaultMap {
    constructor() {
        super(() => 0);
    }
    inc(name) {
        return this.add(name, 1);
    }
    add(name, amount) {
        const count = this.get(name) + amount;
        this.set(name, count);
        return count;
    }
}
class MultiMap extends DefaultMap {
    constructor() {
        super(() => []);
    }
    add(key, value) {
        this.get(key).push(value);
    }
}
"use strict";
const TAU = Math.PI * 2;
const lerp = (s, a, b) => (1.0 - s) * a + s * b;
const clamp = (s, min, max) => Math.min(max, Math.max(min, s));
const clamp01 = (s) => clamp(s, 0.0, 1.0);
const Radians = newtype();
const mapAngle = (r, f) => Radians(f(unwrap(r)));
const Degrees = newtype();
const signum = (v) => {
    if (v < 0)
        return -1;
    if (v > 0)
        return +1;
    return 0;
};
const normalizeRadians = (a) => {
    let r = unwrap(a);
    while (r < 0)
        r += TAU;
    return Radians(r % TAU);
};
const radianDelta = (a, b) => {
    const src = unwrap(normalizeRadians(a));
    const dst = unwrap(normalizeRadians(b));
    const forward = dst - src;
    const backward = (dst - TAU) - src;
    return Radians(Math.abs(forward) < Math.abs(backward) ? forward : backward);
};
const toDegrees = (r) => Degrees(unwrap(r) * 180 / Math.PI);
const toRadians = (d) => Radians(unwrap(d) * Math.PI / 180);
const formatDegrees = (d, decimals = 0) => {
    const s = Math.pow(10.0, decimals);
    return `${Math.round(unwrap(d) * s) / s}°`;
};
const degreeDelta = (a, b) => {
    return toDegrees(radianDelta(toRadians(a), toRadians(b)));
};
const uprightAngle = (a) => {
    const angle = unwrap(normalizeRadians(a));
    if (Math.abs(Math.PI - angle) < Math.PI / 2) {
        return Radians(angle + Math.PI);
    }
    return Radians(angle);
};
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    splus(scale, vec) {
        return new Point(this.x + scale * vec.x, this.y + scale * vec.y);
    }
    plus(vec) {
        return this.splus(1.0, vec);
    }
    minus(vec) {
        return this.splus(-1.0, vec);
    }
    trunc(f = 1.0) {
        return new Point(f * Math.floor(this.x / f), f * Math.floor(this.y / f));
    }
    onLine(a, tan) {
        const s = Vec.between(a, this).dot(tan) / tan.mag2();
        return a.splus(s, tan);
    }
    to(dst) {
        return Vec.between(this, dst);
    }
    lerp(s, pt) {
        return new Point(lerp(s, this.x, pt.x), lerp(s, this.y, pt.y));
    }
    toVec() {
        return new Vec(this.x, this.y);
    }
    toString() {
        return `(${Math.round(this.x * 100) / 100}, ${Math.round(this.y * 100) / 100})`;
    }
    static get ZERO() {
        return new Point(0., 0.);
    }
}
class Axis {
    static get X() {
        return new Vec(1., 0.);
    }
    static get Y() {
        return new Vec(0., 1.);
    }
}
class Vec {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    angle() {
        return Radians(Math.atan2(this.y, this.x));
    }
    r90() {
        return new Vec(-this.y, this.x);
    }
    rotate(radians) {
        const angle = unwrap(radians);
        return new Vec(Math.cos(angle) * this.x - Math.sin(angle) * this.y, Math.sin(angle) * this.x + Math.cos(angle) * this.y);
    }
    dot(vec) {
        return this.x * vec.x + this.y * vec.y;
    }
    mag2() {
        return this.dot(this);
    }
    mag() {
        return Math.sqrt(this.mag2());
    }
    scale(factor) {
        return new Vec(this.x * factor, this.y * factor);
    }
    neg() {
        return new Vec(-this.x, -this.y);
    }
    unit() {
        const mag2 = this.mag2();
        if (mag2 < 0.0001 || mag2 === 1.0)
            return this;
        return this.scale(1.0 / Math.sqrt(mag2));
    }
    splus(scale, vec) {
        return new Vec(this.x + scale * vec.x, this.y + scale * vec.y);
    }
    plus(vec) {
        return this.splus(1.0, vec);
    }
    minus(vec) {
        return this.splus(-1.0, vec);
    }
    onAxis(vec) {
        return vec.scale(this.dot(vec) / vec.mag2());
    }
    offAxis(vec) {
        return this.minus(this.onAxis(vec));
    }
    toPoint() {
        return new Point(this.x, this.y);
    }
    toString() {
        return `<${this.x.toString(4)}, ${this.y.toString(4)}>`;
    }
    static between(a, b) {
        return new Vec(b.x - a.x, b.y - a.y);
    }
    static get ZERO() {
        return new Vec(0., 0.);
    }
}
class Ray {
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction;
    }
    at(t) {
        return this.origin.splus(t, this.direction);
    }
    intersection(other) {
        // (o+d*t - Pq)*Nq =0
        // (O - Pq)*Nq + (Nq*d)*t = 0
        const normal = other.direction.r90();
        const denominator = this.direction.dot(normal);
        if (Math.abs(denominator) < 0.0001)
            return null;
        const time = Vec.between(this.origin, other.origin).dot(normal) / denominator;
        return {
            time,
            point: this.origin.splus(time, this.direction),
        };
    }
}
class Edge {
    constructor(src, dst) {
        this.src = src;
        this.dst = dst;
    }
    get length() { return this.vector().mag(); }
    ray() {
        return new Ray(this.src, this.vector());
    }
    vector() {
        return Vec.between(this.src, this.dst);
    }
    intersects(edge) {
        const e1 = this.vector();
        const e2 = edge.vector();
        const t1 = e1.r90();
        const t2 = e2.r90();
        if (Vec.between(this.src, edge.src).dot(t1) > 0 === Vec.between(this.src, edge.dst).dot(t1) > 0) {
            return false;
        }
        if (Vec.between(edge.src, this.src).dot(t2) > 0 === Vec.between(edge.src, this.dst).dot(t2) > 0) {
            return false;
        }
        return true;
    }
    distance(point) {
        const tangent = this.vector();
        const delta = Vec.between(this.src, point);
        const s = delta.dot(tangent) / tangent.mag2();
        if (s <= 0)
            return Vec.between(this.src, point).mag();
        if (s >= 1)
            return Vec.between(this.dst, point).mag();
        return Vec.between(point, this.src.lerp(s, this.dst)).mag();
    }
    toString() {
        return `[${this.src}, ${this.dst}]`;
    }
}
class Frame {
    constructor(origin, axisI, axisJ) {
        this.origin = origin;
        this.axisI = axisI;
        this.axisJ = axisJ;
    }
    toLocalPoint(p) {
        const delta = Vec.between(this.origin, p);
        return new Point(delta.dot(this.axisI) / this.axisI.mag2(), delta.dot(this.axisJ) / this.axisJ.mag2());
    }
    toLocalVec(v) {
        return new Vec(v.dot(this.axisI) / this.axisI.mag2(), v.dot(this.axisJ) / this.axisJ.mag2());
    }
    toGlobalVec(v) {
        return new Vec(v.x * this.axisI.x + v.y * this.axisJ.x, v.x * this.axisI.y + v.y * this.axisJ.y);
    }
    toGlobalPoint(p) {
        return this.origin.plus(this.toGlobalVec(p.toVec()));
    }
    get project() {
        return {
            vec: v => this.toGlobalVec(v),
            point: p => this.toGlobalPoint(p),
            distance: d => d * Math.sqrt(this.axisI.mag() * this.axisJ.mag()),
        };
    }
    get unproject() {
        return {
            vec: v => this.toLocalVec(v),
            point: p => this.toLocalPoint(p),
            distance: d => d / Math.sqrt(this.axisI.mag() * this.axisJ.mag()),
        };
    }
    toString() {
        return `{O=${this.origin}, I=${this.axisI}, J=${this.axisJ}}`;
    }
    static get identity() {
        return new Frame(Point.ZERO, Axis.X, Axis.Y);
    }
}
"use strict";
class Spaces {
    static get(name) {
        if (!Spaces.map.has(name)) {
            return Spaces.identity;
        }
        return Spaces.map.get(name);
    }
    static put(space) {
        Spaces.map.set(space.name, space);
    }
    static get identity() {
        const frame = Frame.identity;
        return {
            name: 'identity',
            project: frame.project,
            unproject: frame.unproject,
        };
    }
    static calc(wrapResult, func, first, ...args) {
        return wrapResult(Spaces.getCalc(first.space, func, first, ...args), first.space);
    }
    static calcN(wrapResult, func, first, ...args) {
        const result = Spaces.getCalc(first.space, func, first, ...args);
        return result.map(r => wrapResult(r, first.space));
    }
    static getCalc(space, func, first, ...args) {
        const unwrap = (a) => a.get(space);
        const unwrapped = args.map(unwrap);
        return func(first.get(space), ...unwrapped);
    }
}
Spaces.map = new Map();
class BaseSpaceValue {
    constructor(space) {
        this.space = space;
    }
    map(func, ...args) {
        return Spaces.calc(this.create, func, this, ...args);
    }
    to(space) {
        return this.create(this.get(space), space);
    }
    as(wrap) {
        if (wrap === this.constructor) {
            return this;
        }
        return new wrap(this);
    }
    toString() {
        return `${this.constructor.name}(${this.get(this.space)}, ${this.space})`;
    }
}
class SpaceValue {
    constructor(val, space, project, unproject) {
        this.val = val;
        this.space = space;
        this.project = project;
        this.unproject = unproject;
    }
    get(space) {
        if (space === this.space)
            return this.val;
        const src = Spaces.get(this.space);
        const dst = Spaces.get(space);
        return this.project(dst, this.unproject(src, this.val));
    }
    to(space) {
        if (space === this.space)
            return this;
        return this.create(this.get(space), space);
    }
    get value() {
        return this;
    }
    apply(func, ...args) {
        return this.applyInto((v, s) => this.create(v, s), func, ...args);
    }
    applyInto(wrapResult, func, ...args) {
        return Spaces.calc(wrapResult, func, this, ...args);
    }
    get create() {
        return (v, space) => {
            return new SpaceValue(v, space, this.project, this.unproject);
        };
    }
}
class SpaceDistance extends BaseSpaceValue {
    constructor(pos) {
        super(pos.space);
        this.pos = pos;
    }
    get sign() {
        return signum(this.get(this.space));
    }
    get nonzero() {
        return this.get(this.space) !== 0;
    }
    plus(d) {
        return this.map((a, b) => a + b, d);
    }
    splus(s, d) {
        if (typeof s === 'number') {
            return this.map((a, b) => a + s * b, d);
        }
        return this.map((a, s, b) => a + s * b, s, d);
    }
    minus(d) {
        return this.map((a, b) => a - b, d);
    }
    scale(f) {
        if (typeof f === 'number')
            return this.map(d => d * f);
        return this.map((a, b) => a * b, f);
    }
    inverse() {
        return this.map(x => 1.0 / x);
    }
    neg() {
        return this.scale(-1);
    }
    div(divisor) {
        if (typeof divisor === 'number') {
            return this.map(d => d / divisor);
        }
        const scalar = this.map((a, b) => a / b, divisor).get(this.space);
        return scalar;
    }
    lt(other) {
        return this.get(this.space) < other.get(this.space);
    }
    le(other) {
        return this.get(this.space) <= other.get(this.space);
    }
    gt(other) {
        return this.get(this.space) > other.get(this.space);
    }
    ge(other) {
        return this.get(this.space) >= other.get(this.space);
    }
    eq(other) {
        return this.get(this.space) === other.get(this.space);
    }
    ne(other) {
        return this.get(this.space) === other.get(this.space);
    }
    max(other) {
        return this.ge(other) ? this : other;
    }
    min(other) {
        return this.le(other) ? this : other;
    }
    abs() {
        return this.map(a => Math.abs(a));
    }
    get(space) {
        return this.pos.get(space);
    }
    get create() { return SpaceDistance.of; }
    static between(a, b) {
        return Spaces.calc(Distance, (a, b) => Vec.between(a, b).mag(), a, b);
    }
    static of(distance, space) {
        return new SpaceDistance(new SpaceValue(distance, space, (s, d) => s.project.distance(d), (s, d) => s.unproject.distance(d)));
    }
}
const Distance = SpaceDistance.of;
const Distances = {
    between: SpaceDistance.between,
    zero: (space) => Distance(0, space),
};
class SpaceAngle extends BaseSpaceValue {
    constructor(pos) {
        super(pos.space);
        this.pos = pos;
    }
    get(space) {
        return this.pos.get(space);
    }
    getDegrees(space) {
        return toDegrees(this.get(space));
    }
    scale(factor) {
        return this.map(a => mapAngle(a, a => a * factor));
    }
    plus(angle) {
        return Spaces.calc(Angle, (a, b) => (normalizeRadians(Radians(unwrap(a) + unwrap(b)))), this, angle);
    }
    minus(angle) {
        return Spaces.calc(Angle, (a, b) => (Radians(unwrap(a) - unwrap(b))), this, angle);
    }
    normalize() {
        return this.map(a => normalizeRadians(a));
    }
    lt(other) {
        return unwrap(this.get(this.space)) < unwrap(other.get(this.space));
    }
    le(other) {
        return unwrap(this.get(this.space)) <= unwrap(other.get(this.space));
    }
    gt(other) {
        return unwrap(this.get(this.space)) > unwrap(other.get(this.space));
    }
    ge(other) {
        return unwrap(this.get(this.space)) >= unwrap(other.get(this.space));
    }
    eq(other) {
        return unwrap(this.get(this.space)) === unwrap(other.get(this.space));
    }
    ne(other) {
        return unwrap(this.get(this.space)) === unwrap(other.get(this.space));
    }
    toString() {
        return `Angle(${formatDegrees(toDegrees(this.get(this.space)))}, ${this.space})`;
    }
    get create() {
        return SpaceAngle.of;
    }
    static counterClockwiseDelta(a, b) {
        return Spaces.calc(Angle, (a, b) => {
            const src = unwrap(normalizeRadians(a));
            const dst = unwrap(normalizeRadians(b));
            return normalizeRadians(Radians(dst - src));
        }, a, b);
    }
    static clockwiseDelta(a, b) {
        return SpaceAngle.counterClockwiseDelta(a, b)
            .map((a) => mapAngle(a, a => TAU - a));
    }
    static shortestDelta(a, b) {
        return Spaces.calc(Angle, (a, b) => {
            const src = unwrap(normalizeRadians(a));
            const dst = unwrap(normalizeRadians(b));
            const forward = dst - src;
            const backward = (dst - TAU) - src;
            if (Math.abs(forward) < Math.abs(backward)) {
                return Radians(forward);
            }
            return Radians(backward);
        }, a, b);
    }
    static fromVector(v) {
        return Spaces.calc(Angle, (v) => v.angle(), v);
    }
    static of(radians, space) {
        return new SpaceAngle(new SpaceValue(radians, space, (s, angle) => s.project.vec(Axis.X.rotate(angle)).angle(), (s, angle) => s.unproject.vec(Axis.X.rotate(angle)).angle()));
    }
}
const Angle = SpaceAngle.of;
const Angles = {
    zero: (space) => Angle(Radians(0), space),
    fromVector: SpaceAngle.fromVector,
    fromDegrees: (deg, space) => Angle(toRadians(deg), space),
    counterClockwiseDelta: SpaceAngle.counterClockwiseDelta,
    clockwiseDelta: SpaceAngle.clockwiseDelta,
    shortestDelta: SpaceAngle.shortestDelta,
};
class SpaceVec extends BaseSpaceValue {
    constructor(pos) {
        super(pos.space);
        this.pos = pos;
    }
    get(space) {
        return this.pos.get(space);
    }
    angle() {
        return Spaces.calc(Angle, (v) => v.angle(), this);
    }
    rotate(angle) {
        return Spaces.calc(Vector, (a, v) => v.rotate(a), angle, this);
    }
    r90() {
        return this.map(v => v.r90());
    }
    scale(factor) {
        if (typeof factor === 'number') {
            return this.map(v => v.scale(factor));
        }
        return this.map((v, factor) => v.scale(factor), factor);
    }
    div(factor) {
        if (typeof factor === 'number') {
            return this.map(v => v.scale(1.0 / factor));
        }
        return this.map((v, factor) => v.scale(1.0 / factor), factor);
    }
    neg() {
        return this.scale(-1);
    }
    unit() {
        return this.map(v => v.unit());
    }
    splus(scale, vec) {
        if (typeof scale === 'number') {
            return Spaces.calc(Vector, (a, b) => a.splus(scale, b), this, vec);
        }
        return Spaces.calc(Vector, (a, s, b) => a.splus(s, b), this, scale, vec);
    }
    plus(vec) {
        return this.splus(1.0, vec);
    }
    minus(vec) {
        return this.splus(-1.0, vec);
    }
    onAxis(vec) {
        return Spaces.calc(Vector, (a, b) => a.onAxis(b), this, vec);
    }
    offAxis(vec) {
        return Spaces.calc(Vector, (a, b) => a.offAxis(b), this, vec);
    }
    toPosition() {
        return Spaces.calc(Position, (a) => a.toPoint(), this);
    }
    dot(v) {
        return Spaces.calc(Distance, (a, b) => a.dot(b), v, this);
    }
    mag2() {
        return Spaces.calc(Distance, (v) => v.mag2(), this);
    }
    mag() {
        return Spaces.calc(Distance, (v) => v.mag(), this);
    }
    static between(a, b) {
        return Spaces.calc(Vector, (a, b) => Vec.between(a, b), a, b);
    }
    static zero(space) {
        return SpaceVec.of(Vec.ZERO, space);
    }
    static fromAngle(a) {
        return Spaces.calc(Vector, (a) => Axis.X.rotate(a), a);
    }
    get create() { return SpaceVec.of; }
    static of(vec, space) {
        return new SpaceVec(new SpaceValue(vec, space, (s, v) => s.project.vec(v), (s, v) => s.unproject.vec(v)));
    }
}
const Vector = SpaceVec.of;
const Vectors = {
    between: SpaceVec.between,
    zero: SpaceVec.zero,
    fromAngle: SpaceVec.fromAngle,
};
class SpacePos extends BaseSpaceValue {
    constructor(pos) {
        super(pos.space);
        this.pos = pos;
    }
    get(space) {
        return this.pos.get(space);
    }
    splus(scale, vec) {
        if (typeof scale === 'number') {
            return this.map((p, v) => p.splus(scale, v), vec);
        }
        return this.map((p, scale, v) => p.splus(scale, v), scale, vec);
    }
    plus(vec) {
        return this.splus(1.0, vec);
    }
    minus(vec) {
        return this.splus(-1.0, vec);
    }
    trunc(f) {
        return this.map((p, f) => p.trunc(f), f);
    }
    onLine(origin, tangent) {
        return this.map((p, o, t) => p.onLine(o, t), origin, tangent);
    }
    lerp(s, p) {
        return this.map((a, b) => a.lerp(s, b), p);
    }
    toVector() {
        return Spaces.calc(Vector, (p) => p.toVec(), this);
    }
    get create() { return SpacePos.of; }
    eq(other) {
        return Vectors.between(this, other).mag().get(this.space) < 0.001;
    }
    scale(factor) {
        return this.map(p => new Point(p.x * factor, p.y * factor));
    }
    neg() {
        return this.map(p => new Point(-p.x, -p.y));
    }
    static zero(space) {
        return SpacePos.of(Point.ZERO, space);
    }
    static centroid(points) {
        if (points.length === 0) {
            throw new Error('cannot compute the centroid of an empty array.');
        }
        const space = points[0].space;
        if (points.length === 1) {
            return SpacePos.of(points[0].get(space), space);
        }
        const sum = { x: 0, y: 0 };
        points.map(p => p.get(space)).forEach(p => {
            sum.x += p.x;
            sum.y += p.y;
        });
        const n = 1.0 * points.length;
        return SpacePos.of(new Point(sum.x / n, sum.y / n), space);
    }
    static of(point, space) {
        return new SpacePos(new SpaceValue(point, space, (s, p) => s.project.point(p), (s, p) => s.unproject.point(p)));
    }
}
const Position = SpacePos.of;
const Positions = {
    zero: SpacePos.zero,
    centroid: SpacePos.centroid,
};
class SpaceEdge {
    constructor(src, dst) {
        this.src = src;
        this.dst = dst;
    }
    get origin() {
        return this.src;
    }
    get vector() {
        return SpaceVec.between(this.src, this.dst);
    }
    get length() {
        return SpaceDistance.between(this.src, this.dst);
    }
    get normal() {
        return this.tangent.r90();
    }
    get tangent() {
        return this.vector.unit();
    }
    get line() {
        return new Line(this.origin, this.vector);
    }
    get midpoint() {
        return this.lerp(0.5);
    }
    scale(amount) {
        const mid = this.midpoint;
        const half = Vectors.between(mid, this.dst).scale(amount);
        return new SpaceEdge(mid.minus(half), mid.plus(half));
    }
    rotate(angle) {
        const mid = this.midpoint;
        const half = Vectors.between(mid, this.dst).rotate(angle);
        return new SpaceEdge(mid.minus(half), mid.plus(half));
    }
    lerp(s) {
        return Spaces.calc(Position, (a, b) => (a.lerp(s, b)), this.src, this.dst);
    }
    unlerp(p) {
        const displacement = Vectors.between(this.src, p);
        const vector = this.vector;
        return displacement.dot(vector).div(vector.mag2());
    }
    closestPoint(p) {
        const projected = p.minus(Vectors.between(this.origin, p).onAxis(this.normal));
        const s = Vectors.between(this.origin, p).dot(this.vector).div(this.vector.mag2());
        if (s < 0)
            return this.src;
        if (s > 1)
            return this.dst;
        return projected;
    }
    distance(point) {
        return Spaces.calc(Distance, (a, b, p) => {
            return new Edge(a, b).distance(p);
        }, this.src, this.dst, point);
    }
    intersection(other) {
        const ray = new SpaceRay(this.origin, this.vector);
        const hit = ray.intersection(other);
        if (hit === null)
            return null;
        if (hit.time < 0 || hit.time > 1)
            return null;
        if (Vectors.between(other.src, hit.point).dot(other.vector).sign < 0) {
            return null;
        }
        if (Vectors.between(other.dst, hit.point).dot(other.vector.scale(-1)).sign < 0) {
            return null;
        }
        return hit.point;
    }
}
// pew pew
class SpaceRay {
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction;
    }
    get normal() {
        return this.direction.r90().unit();
    }
    at(t) {
        return this.origin.splus(t, this.direction);
    }
    intersection(line) {
        // (o + d * t - q) * N = 0
        // (o-q)N + t(d*N) = 0
        // t = (q-o)N / (d*N)
        const denominator = this.direction.dot(line.normal);
        if (denominator.sign === 0)
            return null;
        const time = Vectors.between(this.origin, line.origin)
            .dot(line.normal).div(denominator);
        return {
            time,
            point: this.at(time),
            // rate * time = distance
            distance: this.direction.mag().scale(time),
        };
    }
    get edge() {
        return new SpaceEdge(this.origin, this.origin.plus(this.direction));
    }
    get line() {
        return new Line(this.origin, this.direction);
    }
}
class SDF {
    contains(point) {
        return this.sdist(point).sign <= 0;
    }
    raycast(ray) {
        // in model space this will typically be ~1 mm, in screen space
        // it's a tenth of a pixel. ie, it's small enough.
        const eps = 0.1;
        const direction = ray.direction.unit();
        let point = ray.origin;
        let distance = this.sdist(point);
        let traveled = Distance(0, distance.space);
        while (distance.get(distance.space) > eps) {
            point = point.splus(distance, direction);
            const newDistance = this.sdist(point);
            if (newDistance.gt(distance)) {
                // we're getting farther away, treat this as a miss
                return null;
            }
            distance = newDistance;
        }
        if (distance.get(distance.space) > eps) {
            return null; // we never made it :/
        }
        return {
            point,
            time: traveled.div(ray.direction.mag()),
            distance: traveled,
        };
    }
}
class Circle extends SDF {
    constructor(center, radius) {
        super();
        this.center = center;
        this.radius = radius;
    }
    get centroid() {
        return this.center;
    }
    sdist(point) {
        return Distances.between(this.center, point).minus(this.radius);
    }
}
class Line extends SDF {
    constructor(origin, tangent) {
        super();
        this.origin = origin;
        this.tangent = tangent.unit();
    }
    get normal() {
        return this.tangent.r90();
    }
    project(point) {
        return point.splus(this.sdist(point).neg(), this.normal);
    }
    distance(point) {
        return this.sdist(point).abs();
    }
    sdist(point) {
        return Vectors.between(this.origin, point).dot(this.normal);
    }
    get centroid() {
        return this.origin;
    }
}
class HalfPlane extends SDF {
    constructor(origin, normal) {
        super();
        this.origin = origin;
        this.normal = normal;
    }
    sdist(point) {
        return Vectors.between(this.origin, point).dot(this.normal).neg();
    }
    get tangent() {
        return this.tangent.unit();
    }
    get centroid() {
        return this.origin;
    }
}
class Rect extends SDF {
    constructor(
    // these are private bc they're kinda a lie; which direction
    // is up/down/left/right varies depending on the coordinate system.
    // the important thing is that they are opposite corners.
    topLeft, bottomRight) {
        super();
        this.topLeft = topLeft;
        this.bottomRight = bottomRight;
        const diagonal = Vectors.between(topLeft, bottomRight);
        // again, these directions are massive air quotes
        const right = diagonal.onAxis(Vector(Axis.X, diagonal.space));
        const down = diagonal.onAxis(Vector(Axis.Y, diagonal.space));
        const bottomLeft = topLeft.plus(down);
        const topRight = topLeft.plus(right);
        this.corners = [topLeft, topRight, bottomRight, bottomLeft];
    }
    sdist(point) {
        const centroid = this.centroid;
        const [first, ...more] = this.edges.map(e => {
            const hp = new HalfPlane(e.src, e.normal);
            return hp.sdist(point).scale(-hp.sdist(centroid).sign);
        });
        return more.reduce((a, b) => a.max(b), first);
    }
    get top() {
        return new SpaceEdge(this.corners[0], this.corners[1]);
    }
    get bottom() {
        return new SpaceEdge(this.corners[3], this.corners[2]);
    }
    get edges() {
        return this.corners.map((c, i) => new SpaceEdge(c, this.corners[(i + 1) % this.corners.length]));
    }
    get centroid() {
        return this.topLeft.lerp(0.5, this.bottomRight);
    }
    eq(rect) {
        return this.corners.every((c, i) => c.eq(rect.corners[i]));
    }
}
class Polygon extends SDF {
    constructor(vertices) {
        super();
        this._centroid = Memo(() => Positions.centroid(this._vertices));
        this._convex = Memo(() => {
            if (this._vertices.length < 3)
                return false;
            for (let i = 0; i < this._vertices.length; i++) {
                const a = this._vertices[i];
                const b = this._vertices[(i + 1) % this._vertices.length];
                const c = this._vertices[(i + 2) % this._vertices.length];
                const ab = Vectors.between(a, b);
                const bc = Vectors.between(b, c);
                if (ab.r90().dot(bc).sign > 0) {
                    return false;
                }
            }
            return true;
        });
        this._radius = Memo(() => {
            const centroid = this.centroid;
            return this._vertices.map(v => Distances.between(centroid, v))
                .reduce((a, b) => a.max(b), Distance(0, centroid.space));
        });
        this._area = Memo(() => Polygon.computeArea(this._vertices));
        this._vertices = [...vertices];
    }
    translate(delta) {
        return new Polygon(this.vertices.map(v => v.plus(delta)));
    }
    rotate(angle) {
        return new Polygon(this.vertices.map(v => v.toVector().rotate(angle).toPosition()));
    }
    get radius() {
        return this._radius();
    }
    get vertices() {
        return [...this._vertices];
    }
    get edges() {
        return this._vertices.map((v, i, arr) => new SpaceEdge(v, arr[(i + 1) % arr.length]));
    }
    get centroid() {
        return this._centroid();
    }
    get isDegenerate() {
        return this._vertices.length < 3;
    }
    get isConvex() {
        return this._convex();
    }
    get bounds() {
        const space = this._vertices.length > 0 ? this._vertices[0].space : 'model';
        let minX = 0;
        let maxX = 0;
        let minY = 0;
        let maxY = 0;
        for (let i = 0; i < this._vertices.length; i++) {
            const v = this._vertices[i].get(space);
            if (i === 0) {
                minX = v.x;
                minY = v.y;
                maxX = v.x;
                maxY = v.y;
                continue;
            }
            minX = Math.min(minX, v.x);
            minY = Math.min(minY, v.y);
            maxX = Math.max(maxX, v.x);
            maxY = Math.max(maxY, v.y);
        }
        return new Rect(Position(new Point(minX, minY), space), Position(new Point(maxX, maxY), space));
    }
    get area() {
        return this._area();
    }
    sdist(point) {
        const inside = this.contains(point);
        let closest = Distance(Number.POSITIVE_INFINITY, 'model');
        for (const edge of this.edges) {
            const d = edge.distance(point);
            if (d.lt(closest)) {
                closest = d;
            }
        }
        return inside ? closest.neg() : closest;
    }
    contains(point) {
        if (Vectors.between(this.centroid, point).mag2().gt(this.radius.scale(this.radius))) {
            return false;
        }
        if (this.isConvex) {
            return this.containsConvex(point);
        }
        return this.containsConcave(point);
    }
    containsConvex(point) {
        for (const edge of this.edges) {
            const vec = Vectors.between(edge.midpoint, point);
            if (vec.dot(edge.vector.r90()).sign > 0) {
                return false;
            }
        }
        return true;
    }
    containsConcave(point) {
        // first do a cheap OOB test to avoid raycasting where possible
        const bounds = this.bounds;
        if (!bounds.contains(point)) {
            return false;
        }
        const edges = this.edges;
        for (let attempt = 0; attempt < 10; attempt++) {
            const ray = attempt === 0
                ? new SpaceRay(point, Vector(Axis.X, point.space))
                : new SpaceRay(point, Vector(new Vec(0.5, Math.random() * 2 - 1), point.space).unit());
            const check = this.raycastCheck(ray, edges);
            if (check === 'inside')
                return true;
            if (check === 'outside')
                return false;
        }
        // oh no, rngesus has failed us
        return false;
    }
    scale(factor) {
        const centroid = this.centroid;
        return new Polygon(this.vertices
            .map(v => Vectors.between(centroid, v))
            .map(v => v.scale(factor))
            .map(v => centroid.plus(v)));
    }
    pad(amount, ...axes) {
        const centroid = this.centroid;
        return new Polygon(this.vertices.map(v => {
            const offset = Vectors.between(centroid, v);
            let result = offset;
            for (const axis of axes) {
                const current = offset.dot(axis);
                result = result.splus(amount.scale(current.sign), axis.div(axis.mag()));
            }
            return centroid.plus(result);
        }));
    }
    raycastCheck(ray, edges) {
        const eps = 0.001;
        let hits = 0;
        for (const edge of edges) {
            const hit = ray.intersection(edge);
            if (hit === null)
                continue;
            const s = edge.unlerp(hit.point);
            if (Math.abs(s) < eps || Math.abs(1 - s) < eps) {
                return 'indeterminate';
            }
            if (s < 0 || s > 1) {
                continue;
            }
            if (Math.abs(hit.time) < eps) {
                return 'indeterminate';
            }
            if (hit.time > 0) {
                hits += 1;
            }
        }
        return hits % 2 === 0 ? 'outside' : 'inside';
    }
    static computeArea(verts) {
        if (verts.length === 0) {
            return Distance(0, 'model');
        }
        const space = verts[0].space;
        let area = 0;
        for (let i = 0; i < verts.length; i++) {
            const a = verts[i].toVector().get(space);
            const b = verts[(i + 1) % verts.length].toVector().get(space);
            area += a.x * b.y - a.y * b.x;
        }
        return Distance(Math.abs(area / 2), space);
    }
    static regular(center, radius, sides) {
        return new Polygon(new Array(sides).fill(center).map((c, i) => c.splus(radius, Vectors.fromAngle(Angle(Radians(2 * Math.PI * i / sides), center.space)))));
    }
    static arrow(src, dst, width) {
        const headWidth = width.scale(5);
        const headHeight = width.scale(10);
        const vector = Vectors.between(src, dst);
        const tangent = vector.unit();
        const shaftLength = vector.mag().minus(headHeight)
            .max(Distances.zero(src.space));
        const normal = tangent.r90();
        return new Polygon([
            src.splus(width.scale(0.5), normal),
            src.splus(width.scale(0.5), normal).splus(shaftLength, tangent),
            src.splus(headWidth.scale(0.5), normal).splus(shaftLength, tangent),
            dst,
            src.splus(headWidth.scale(-0.5), normal).splus(shaftLength, tangent),
            src.splus(width.scale(-0.5), normal).splus(shaftLength, tangent),
            src.splus(width.scale(-0.5), normal),
        ]);
    }
    static lollipop(src, dst, width) {
        const vector = Vectors.between(src, dst);
        const length = vector.mag();
        const headWidth = width.scale(3).min(length.scale(0.9));
        const headHeight = headWidth.scale(1);
        const tangent = vector.unit();
        const shaftLength = vector.mag().minus(headHeight)
            .max(Distances.zero(src.space));
        const normal = tangent.r90();
        const start = [
            src.splus(width.scale(0.5), normal),
            src.splus(width.scale(0.5), normal).splus(shaftLength, tangent),
        ];
        const end = [
            src.splus(width.scale(-0.5), normal).splus(shaftLength, tangent),
            src.splus(width.scale(-0.5), normal),
        ];
        const n = 16;
        const middle = new Array(n).fill(0).map((_, i) => i / (n - 1.0)).map(s => {
            // arc from start[2] to dst to end[0]
            const a = start[1];
            const b = end[0];
            const mid = a.lerp(0.5, b).splus(headWidth.scale(0.5), tangent);
            const ma = Vectors.between(mid, a)
                .unit()
                .scale(headWidth)
                .scale(0.5);
            const angle = Angle(Radians(-s * Math.PI * 1.9 + Math.PI / 3), src.space);
            return mid.plus(ma.rotate(angle));
        });
        return new Polygon([
            ...start,
            ...middle,
            ...end,
        ]);
    }
}
class Triangle extends Polygon {
    constructor(a, b, c) {
        super([a, b, c]);
    }
    get a() { return this.vertices[0]; }
    get b() { return this.vertices[1]; }
    get c() { return this.vertices[2]; }
    get area() {
        const ab = Vectors.between(this.a, this.b).get(this.a.space);
        const ac = Vectors.between(this.a, this.c).get(this.a.space);
        // ortho comp of cross product. since these are 2d vectors,
        // the absolute value of this is equal to the magnitude of
        // the cross product
        const det = (ab.x * ac.y) - (ab.y * ac.x);
        // the magnitude of a cross product is equal to the area
        // of the parallogram formed by the two vectors, so half
        // that is the area of this triangle.
        return Distance(Math.abs(det) / 2.0, this.a.space);
    }
    contains(p) {
        return super.containsConvex(p);
    }
    sdist(p) {
        const [first, ...more] = this.edges.map(e => e.distance(p));
        return more.reduce((a, b) => a.min(b), first)
            .scale(this.contains(p) ? -1 : 1);
    }
    scale(s) {
        const v = super.scale(s).vertices;
        return new Triangle(v[0], v[1], v[2]);
    }
    static triangulate(poly) {
        if (poly.isConvex)
            return Triangle.triangulateConvex(poly);
        // ear clipping method, O(n^2)
        const vertices = poly.vertices;
        let indices = vertices.map((_, i) => i);
        const results = [];
        const checkTriangle = (v0, v1, v2) => {
            const a = vertices[v0];
            const b = vertices[v1];
            const c = vertices[v2];
            const ab = new SpaceEdge(a, b);
            const bc = new SpaceEdge(b, c);
            const ca = new SpaceEdge(c, a);
            if (ab.vector.r90().dot(bc.vector).sign >= 0) { // .dot -h-a-c-k- sign
                // angle is >= 180 deg, would make an OOB triangle
                return false;
            }
            const verts = new Set([v0, v1, v2]);
            // now check for self intersections ....
            for (let i = 0; i < indices.length; i++) {
                const middle = indices[i];
                if (verts.has(middle))
                    continue;
                const left = indices[(i - 1 + indices.length) % indices.length];
                const right = indices[(i + 1) % indices.length];
                const el = new SpaceEdge(vertices[middle], vertices[left]);
                const er = new SpaceEdge(vertices[middle], vertices[right]);
                const leftTests = [];
                const rightTests = [];
                if (left !== v0 && left !== v1)
                    leftTests.push(ab);
                if (left !== v0 && left !== v2)
                    leftTests.push(ca);
                if (left !== v1 && left !== v2)
                    leftTests.push(bc);
                if (right !== v0 && right !== v1)
                    rightTests.push(ab);
                if (right !== v0 && right !== v2)
                    rightTests.push(ca);
                if (right !== v1 && right !== v2)
                    rightTests.push(bc);
                if (leftTests.some(e => e.intersection(el)))
                    return false;
                if (rightTests.some(e => e.intersection(er)))
                    return false;
            }
            return true;
        };
        while (indices.length >= 3) {
            let progressed = false;
            for (let i = 0; i < indices.length; i++) {
                const v0 = indices[i];
                const v1 = indices[(i + 1) % indices.length];
                const v2 = indices[(i + 2) % indices.length];
                if (!checkTriangle(v0, v1, v2))
                    continue;
                // woo we found one
                results.push([v0, v1, v2]);
                // cut off the ear >:3
                indices = indices.filter(k => k !== v1);
                progressed = true;
                break;
            }
            if (!progressed) {
                // give up, this parrot watches too much anime
                // (this poly[gon] is degenerate)
                break;
            }
        }
        return results.map(([a, b, c]) => new Triangle(vertices[a], vertices[b], vertices[c]));
    }
    static triangulateConvex(poly) {
        if (poly.isDegenerate)
            return [];
        const [first, ...more] = poly.vertices;
        const results = [];
        for (let i = 0; i < more.length - 1; i++) {
            results.push(new Triangle(first, more[i], more[i + 1]));
        }
        return results;
    }
}
"use strict";
class Time {
    static get delta() {
        return Time._delta;
    }
    static get last() {
        return Time._last;
    }
    static get now() {
        return new Date().getTime() / 1000.0;
    }
    static get fps() {
        return Math.round(Time._fpsHistory.reduce((a, b) => a + b, 0) / Time._fpsHistory.length);
    }
    static tick() {
        const now = Time.now;
        Time._delta = clamp(now - Time._last, Time.MIN_DELTA, Time.MAX_DELTA);
        Time._last = now;
        const fps = Math.round(Time._delta <= 0 ? 0 : 1.0 / Time._delta);
        Time._fpsHistory[Time._fpsIndex++] = fps;
    }
}
// it may be a long time between timesteps if the browser
// tab is suspended or something; don't freak out!.
Time.MAX_DELTA = 1;
// prevent e.g. divide by zeroes
Time.MIN_DELTA = 0.01;
Time._last = new Date().getTime() / 1000.0;
Time._delta = 0.;
Time._fpsIndex = 0;
Time._fpsHistory = new Array(10).fill(0);
"use strict";
const WHITESPACE_PATTERN = /\s+/img;
const UNITLESS = 'unitless';
class Amount {
    constructor(value, unit) {
        this.value = value;
        this.unit = unit;
    }
    toString() {
        return `${this.value} ${this.unit}`;
    }
}
const roundBy = (num, decimals = 1) => {
    if (decimals < 1)
        return Math.round(num);
    const s = Math.pow(10, Math.round(decimals));
    return Math.round(num * s) / s;
};
const prettyNum = (num) => {
    return num.toLocaleString();
};
const UnitPatternNumeric = newtype();
const UnitPatternLiteral = newtype();
class UnitParser {
    constructor(pattern, parseFunc) {
        this.pattern = pattern;
        this.parseFunc = parseFunc;
    }
    parse(text) {
        const arr = this.pattern.match(text);
        if (arr === null)
            return null;
        return this.parseFunc(...arr);
    }
    toString() {
        return `${this.pattern}`;
    }
}
class UnitPattern {
    constructor(pattern) {
        this.pattern = pattern;
        const parts = ['^'];
        let index = 0;
        for (const item of pattern) {
            if (unwrap(item).match(UnitPattern.DIGIT)) {
                parts.push(`(?<i${index++}>([-]?)([0-9]+([.][0-9]*)?)|([.][0-9]+))`);
            }
            else {
                parts.push(unwrap(item));
            }
        }
        parts.push('$');
        this.regex = new RegExp(parts.join(''), 'i');
    }
    match(text) {
        const sanitized = text.replace(/[ ,\t\n]+/img, '');
        const match = this.regex.exec(sanitized);
        if (!match || typeof match.groups === 'undefined')
            return null;
        const map = new Map();
        const results = [];
        for (const el of this.pattern) {
            if (unwrap(el).match(UnitPattern.DIGIT)) {
                const name = unwrap(el);
                const value = match.groups[`i${results.length}`];
                results.push(parseFloat(value));
            }
        }
        return results;
    }
    static parse(text) {
        const sanitized = text.replace(WHITESPACE_PATTERN, '');
        const pattern = [];
        let inNumeric = false;
        let inLiteral = false;
        let start = 0;
        for (let i = 0; i < sanitized.length; i++) {
            const c = sanitized.charAt(i);
            if (UnitPattern.DIGIT.test(c)) {
                if (inLiteral) {
                    pattern.push(UnitPatternLiteral(sanitized.substring(start, i)));
                    inLiteral = false;
                }
                if (!inNumeric) {
                    inNumeric = true;
                    start = i;
                }
            }
            else {
                if (inNumeric) {
                    pattern.push(UnitPatternNumeric(sanitized.substring(start, i)));
                    inNumeric = false;
                }
                if (!inLiteral) {
                    start = i;
                    inLiteral = true;
                }
            }
        }
        if (inLiteral)
            pattern.push(UnitPatternLiteral(sanitized.substring(start)));
        if (inNumeric)
            pattern.push(UnitPatternNumeric(sanitized.substring(start)));
        return new UnitPattern(pattern);
    }
    toString() {
        return this.pattern.map(x => x.toString()).join('');
    }
}
UnitPattern.UPPER = /[A-Z]+/img;
UnitPattern.DIGIT = /[0-9]/img;
class Unit {
    constructor(name, abbrev, family) {
        this.name = name;
        this.abbrev = abbrev;
        this.family = family;
        this.aliases = new Set();
        this.parsers = [];
        this._format = null;
        this._units = null;
        for (const alias of [this.abbrev, this.name, `${this.name}s`]) {
            this.addAlias(alias);
        }
    }
    // set reference to other units of the same measurement type
    setUnits(units) {
        this._units = units;
    }
    addAlias(alias) {
        if (this.aliases.has(alias)) {
            return this;
        }
        this.aliases.add(alias);
        this.parsers.push(new UnitParser(UnitPattern.parse(`0${alias}`), (x) => new Amount(x, this.name)));
        return this;
    }
    addParser(pattern, parseFunc) {
        this.parsers.push(new UnitParser(UnitPattern.parse(pattern), parseFunc));
        return this;
    }
    getAliases() {
        return Array.from(this.aliases);
    }
    setFormat(formatter) {
        this._format = formatter;
        return this;
    }
    matches(text) {
        return this.parsers.some(p => !!p.parse(text));
    }
    parse(text) {
        for (const parser of this.parsers) {
            const a = parser.parse(text);
            if (a !== null)
                return a;
        }
        return null;
    }
    from(amount) {
        if (this.aliases.has(amount.unit))
            return amount;
        return this._units.convert(amount, this.name);
    }
    format(amount, decimals = 2) {
        if (!this.aliases.has(amount.unit)) {
            return this.format(this.from(amount), decimals);
        }
        if (this._format !== null) {
            return this._format(amount, decimals);
        }
        const value = roundBy(amount.value, decimals);
        return `${prettyNum(value)} ${this.abbrev}`;
    }
    newAmount(value) {
        return {
            value,
            unit: this.name,
        };
    }
    toString() {
        return `${this.name} (${this.abbrev}): ${this.parsers.map(p => p.toString()).join(', ')}`;
    }
}
class UnitConversions {
    // for conversion between units that are equal when the value
    // amount is 0 (true for things like feet to meters, false for
    // things like kelvin to celsius).
    static scaling(srcUnit, dstUnit, scaleFactor) {
        return {
            srcUnit,
            dstUnit,
            srcLo: 0,
            srcHi: 1,
            dstLo: 0,
            dstHi: scaleFactor,
        };
    }
    static invert(c) {
        return {
            srcUnit: c.dstUnit,
            dstUnit: c.srcUnit,
            srcLo: c.dstLo,
            srcHi: c.dstHi,
            dstLo: c.srcLo,
            dstHi: c.srcHi,
        };
    }
    static apply(amount, c) {
        if (c.srcUnit !== amount.unit) {
            throw new Error(`Cannot use unit conversion from ${c.srcUnit}->${c.dstUnit} for ${amount.unit}!`);
        }
        const s = 1.0 * (amount.value - c.srcLo) / (c.srcHi - c.srcLo);
        return new Amount(lerp(s, c.dstLo, c.dstHi), c.dstUnit);
    }
}
class Units {
    constructor() {
        this.conversions = new Map();
        this.units = new Map();
        this.aliases = new Map();
        this.add(new Unit(UNITLESS, '', 'esoteric'));
    }
    add(x) {
        if (x instanceof Unit) {
            this.addUnit(x);
        }
        else {
            this.addConversion(x);
        }
        return this; // for chaining
    }
    get(unit) {
        return this.units.get(this.aliases.get(unit) || unit);
    }
    parse(text) {
        for (const unit of this.units.values()) {
            const a = unit.parse(text);
            if (a !== null)
                return a;
        }
        return null;
    }
    getUnits() {
        return Array.from(this.units.values());
    }
    addUnit(u) {
        this.units.set(u.name, u);
        u.setUnits(this);
        for (const alias of u.getAliases()) {
            if (this.aliases.has(alias)) {
                throw new Error(`Cannot add alias ${alias}->${u.name}, as it would collid with ${this.aliases.get(alias)}`);
            }
            this.aliases.set(alias, u.name);
        }
    }
    addConversion(c) {
        const srcUnit = this.get(c.srcUnit);
        const dstUnit = this.get(c.dstUnit);
        if (!srcUnit)
            throw new Error(`Unknown unit ${c.srcUnit}`);
        if (!dstUnit)
            throw new Error(`Unknown unit ${c.dstUnit}`);
        // normalize
        const src = srcUnit.name;
        const dst = dstUnit.name;
        if (src !== c.srcUnit || dst !== c.dstUnit) {
            this.addConversion(Object.assign(Object.assign({}, c), { srcUnit: src, dstUnit: dst }));
            return;
        }
        if (!this.conversions.has(c.srcUnit)) {
            this.conversions.set(c.srcUnit, []);
        }
        if (!this.conversions.has(c.dstUnit)) {
            this.conversions.set(c.dstUnit, []);
        }
        this.conversions.get(c.srcUnit).push(c);
        this.conversions.get(c.dstUnit).push(UnitConversions.invert(c));
    }
    convert(amount, targetUnit) {
        const canonicalTarget = this.aliases.get(targetUnit) || targetUnit;
        if (!this.units.has(amount.unit)) {
            throw new Error(`Amount is in an unknown unit: ${JSON.stringify(amount)}.`);
        }
        if (!this.units.has(canonicalTarget)) {
            throw new Error(`Cannot convert ${JSON.stringify(amount)} to unknown unit ${canonicalTarget}`);
        }
        ;
        const frontier = [
            { unit: amount.unit, conversions: [] }
        ];
        const visited = new Set();
        while (frontier.length > 0) {
            const [node] = frontier.splice(0, 1);
            if (visited.has(node.unit)) {
                continue;
            }
            visited.add(node.unit);
            if (node.unit === canonicalTarget) {
                let a = amount;
                for (const c of node.conversions) {
                    a = UnitConversions.apply(a, c);
                }
                return a;
            }
            const neighbors = this.conversions.get(node.unit);
            if (typeof neighbors === 'undefined') {
                continue;
            }
            for (const c of neighbors) {
                if (visited.has(c.dstUnit)) {
                    continue;
                }
                frontier.push({
                    unit: c.dstUnit,
                    conversions: [...node.conversions, c],
                });
            }
        }
        throw new Error(`No conversion path found from ${amount.unit} to ${canonicalTarget}.`);
    }
    format(amount, decimals = 2) {
        const unit = this.get(amount.unit);
        if (typeof unit === 'undefined') {
            return `${amount.value} ${amount.unit}`;
        }
        return unit.format(amount, decimals);
    }
}
Units.distance = new Units();
Units.distance
    .add(new Unit('kilometer', 'km', 'metric'))
    .add(new Unit('hectometer', 'hm', 'metric'))
    .add(new Unit('dekameter', 'dam', 'metric'))
    .add(new Unit('meter', 'm', 'metric'))
    .add(new Unit('decimeter', 'dm', 'metric'))
    .add(new Unit('centimeter', 'cm', 'metric'))
    .add(new Unit('millimeter', 'mm', 'metric'))
    .add(new Unit('micrometer', 'μm', 'metric')
    .addAlias('micron')
    .addAlias('microns'))
    .add(new Unit('nanometer', 'nm', 'metric'))
    .add(new Unit('femtometer', 'fm', 'metric'))
    .add(new Unit('zeptometer', 'zm', 'metric'))
    .add(new Unit('thou', 'mil', 'imperial'))
    .add(new Unit('feet', 'ft', 'imperial')
    .addAlias('foot')
    .addParser('0\'', x => new Amount(x, 'feet'))
    .addParser('0\'0\"', (feet, inches) => new Amount(feet + inches / 12.0, 'feet'))
    .setFormat((amount, decimals) => {
    const feet = Math.floor(amount.value);
    // we subtract 1 from the rounding, bc we're
    // displaying in feet and inches, which is more
    // precision than 1 decimal point already.
    const inches = roundBy(12.0 * (amount.value - feet), typeof decimals === 'undefined' ? 0 : decimals - 1);
    if (inches >= 12) {
        // lul, rounding is fun
        return `${prettyNum(feet + 1)}'`;
    }
    if (inches < 0.001) {
        return `${prettyNum(feet)}'`;
    }
    if (feet === 0) {
        return `${prettyNum(inches)}"`;
    }
    return `${prettyNum(feet)}'${inches}"`;
}))
    .add(new Unit('inch', 'in', 'imperial')
    .addParser('0\"', x => new Amount(x, 'inch'))
    .setFormat((amount, decimals) => `${prettyNum(roundBy(amount.value, decimals))}"`))
    .add(new Unit('yard', 'y', 'imperial'))
    .add(new Unit('mile', 'mi', 'imperial'))
    .add(new Unit('light-year', 'ly', 'esoteric'))
    .add(new Unit('light-hour', 'lh', 'esoteric'))
    .add(new Unit('light-minute', 'lm', 'esoteric'))
    .add(new Unit('light-second', 'ls', 'esoteric'))
    .add(new Unit('light-millisecond', 'lms', 'esoteric'))
    .add(new Unit('light-microsecond', 'lμs', 'esoteric'))
    .add(new Unit('light-nanosecond', 'lns', 'esoteric'))
    .add(new Unit('light-femtosecond', 'lfs', 'esoteric'))
    .add(new Unit('furlong', 'fur', 'esoteric'))
    .add(new Unit('pixel', 'px', 'esoteric'))
    .add(new Unit('league', 'lg', 'esoteric'))
    .add(new Unit('fathom', 'ftm', 'esoteric'))
    .add(new Unit('nautical mile', 'nmi', 'esoteric'))
    .add(new Unit('chain', 'chains', 'esoteric'))
    .add(new Unit('rod', 'rods', 'esoteric'))
    .add(new Unit('parsec', 'pc', 'esoteric'))
    .add(new Unit('astronomical unit', 'au', 'esoteric'))
    .add(new Unit('smoot', 'smoot', 'esoteric')
    .setFormat((a, d) => a.value === 1 ? '1 smoot' : `${prettyNum(roundBy(a.value, d))} smoots`))
    .add(new Unit('gwen', 'gwen', 'esoteric').setFormat((a, d) => {
    return a.value === 1 ? '1 gwen' : `${prettyNum(roundBy(a.value, d))} gwens`;
}))
    .add(UnitConversions.scaling('km', 'm', 1e3))
    .add(UnitConversions.scaling('hm', 'm', 1e2))
    .add(UnitConversions.scaling('dam', 'm', 10))
    .add(UnitConversions.scaling('m', 'dm', 10))
    .add(UnitConversions.scaling('m', 'cm', 1e2))
    .add(UnitConversions.scaling('m', 'mm', 1e3))
    .add(UnitConversions.scaling('mm', 'μm', 1e3))
    .add(UnitConversions.scaling('μm', 'nm', 1e3))
    .add(UnitConversions.scaling('nm', 'fm', 1e6))
    .add(UnitConversions.scaling('fm', 'zm', 1e6))
    .add(UnitConversions.scaling('ft', 'in', 12))
    .add(UnitConversions.scaling('yard', 'ft', 3))
    .add(UnitConversions.scaling('mile', 'feet', 5280))
    .add(UnitConversions.scaling('mile', 'furlong', 8))
    .add(UnitConversions.scaling('in', 'mil', 1000))
    .add(UnitConversions.scaling('league', 'mi', 3))
    .add(UnitConversions.scaling('fathom', 'ft', 6))
    .add(UnitConversions.scaling('nautical mile', 'm', 1852))
    .add(UnitConversions.scaling('in', 'mm', 25.4))
    .add(UnitConversions.scaling('chain', 'yard', 22))
    .add(UnitConversions.scaling('chain', 'rod', 4))
    .add(UnitConversions.scaling('ly', 'km', 9.46e+12))
    .add(UnitConversions.scaling('parsec', 'light-year', 3.26156))
    .add(UnitConversions.scaling('in', 'px', 96))
    .add(UnitConversions.scaling('au', 'km', 1.496e8))
    .add(UnitConversions.scaling('light-year', 'light-hour', 8766))
    .add(UnitConversions.scaling('light-hour', 'light-minute', 60))
    .add(UnitConversions.scaling('light-minute', 'light-second', 60))
    .add(UnitConversions.scaling('light-second', 'light-millisecond', 1000))
    .add(UnitConversions.scaling('light-millisecond', 'light-microsecond', 1e3))
    .add(UnitConversions.scaling('light-millisecond', 'light-nanosecond', 1e6))
    .add(UnitConversions.scaling('light-nanosecond', 'light-femtosecond', 1e6))
    .add(UnitConversions.scaling('smoot', 'in', 67))
    .add(UnitConversions.scaling('gwen', 'in', 66));
"use strict";
const iconUrl = (name) => {
    const path = window.location.pathname.startsWith('/')
        ? window.location.pathname.substring(1)
        : window.location.pathname;
    const subpath = path.length > 0 ? `${path}/icons/${name}` : `icons/${name}`;
    return new URL(`${window.location.protocol}//${window.location.host}/${subpath}`);
};
const Icons = {
    //snapGuidesOff: iconUrl('snap-guides-off.svg'),
    //snapGuidesOn: iconUrl('snap-guides-on.svg'),
    alignToWall: iconUrl('align-to-wall.svg'),
    angleLocked: iconUrl('angle-locked.svg'),
    angleUnlocked: iconUrl('angle-unlocked.svg'),
    aspectLocked: iconUrl('aspect-locked.svg'),
    aspectUnlocked: iconUrl('aspect-unlocked.svg'),
    axisLocked: iconUrl('axis-locked.svg'),
    axisUnlocked: iconUrl('axis-unlocked.svg'),
    axisX: iconUrl('axis-x.svg'),
    axisY: iconUrl('axis-y.svg'),
    centerOnWall: iconUrl('center-on-wall.svg'),
    door: iconUrl('door.svg'),
    editRedo: iconUrl('redo.svg'),
    editUndo: iconUrl('undo.svg'),
    exportImage: iconUrl('export-png.svg'),
    furniture: iconUrl('furniture.svg'),
    flipH: iconUrl('fliph.svg'),
    flipV: iconUrl('flipv.svg'),
    heartInfo: iconUrl('heart-info.svg'),
    hideAngles: iconUrl('hide-angles.svg'),
    hideGrid: iconUrl('hide-grid.svg'),
    hideGuides: iconUrl('hide-guides.svg'),
    hideJoints: iconUrl('hide-joints.svg'),
    hideLengths: iconUrl('hide-lengths.svg'),
    invisible: iconUrl('eye-closed.svg'),
    image: iconUrl('image.svg'),
    imageUpload: iconUrl('image-upload.svg'),
    jointTool: iconUrl('joint-tool.svg'),
    kinematicsOff: iconUrl('kinematics-off.svg'),
    kinematicsOn: iconUrl('kinematics-on.svg'),
    lengthLocked: iconUrl('length-locked.svg'),
    lengthUnlocked: iconUrl('length-unlocked.svg'),
    lockSmall: iconUrl('lock-small.png'),
    moveToWall: iconUrl('move-to-wall.svg'),
    moveToCorner: iconUrl('move-to-corner.svg'),
    newFile: iconUrl('new-page.svg'),
    openFile: iconUrl('open-file.svg'),
    panTool: iconUrl('grab.svg'),
    pen: iconUrl('pen.svg'),
    plain: iconUrl('plain.svg'),
    pointerTool: iconUrl('cursor.svg'),
    posLocked: iconUrl('pos-locked.svg'),
    posUnlocked: iconUrl('pos-unlocked.svg'),
    recenter: iconUrl('recenter.svg'),
    resetAspectRatio: iconUrl('reset-aspect-ratio.svg'),
    roomTool: iconUrl('draw-room.svg'),
    rotate: iconUrl('rotate.svg'),
    rulerCursor: iconUrl('ruler-cursor.svg'),
    rulerTool: iconUrl('ruler.svg'),
    saveFile: iconUrl('save-file.svg'),
    showAngles: iconUrl('show-angles.svg'),
    showGrid: iconUrl('show-grid.svg'),
    showJoints: iconUrl('show-joints.svg'),
    showGuides: iconUrl('show-guides.svg'),
    showLengths: iconUrl('show-lengths.svg'),
    snapGeomOff: iconUrl('snap-geom-off.svg'),
    snapGeomOn: iconUrl('snap-geom-on.svg'),
    snapGlobalOff: iconUrl('snap-global-off.svg'),
    snapGlobalOn: iconUrl('snap-global-on.svg'),
    snapGridOff: iconUrl('grid-snap-off.svg'),
    snapGridOn: iconUrl('grid-snap-on.svg'),
    snapLocalOff: iconUrl('snap-local-off.svg'),
    snapLocalOn: iconUrl('snap-local-on.svg'),
    snapOff: iconUrl('snap-off.svg'),
    snapOn: iconUrl('snap-on.svg'),
    toBack: iconUrl('to-back.svg'),
    toFront: iconUrl('to-front.svg'),
    visible: iconUrl('eye-open.svg'),
    window: iconUrl('window.svg'),
    wood: iconUrl('wood.svg'),
    zoomIn: iconUrl('zoom-in.svg'),
    zoomOut: iconUrl('zoom-out.svg'),
};
const IconImages = (() => {
    const result = {};
    for (const key of Object.keys(Icons)) {
        const image = new Image();
        image.src = Icons[key].toString();
        result[key] = image;
    }
    return result;
})();
"use strict";
const MoreJsonUtil = {
    unitsFor: (s) => {
        if (s.space === 'model')
            return App.project.modelUnit.name;
        return s.space;
    },
    fromUnits: (s, unit) => {
        if (s.space === 'screen')
            return s;
        const f = App.project.modelUnit.from(new Amount(1.0, unit)).value;
        return f === 1.0 ? s : s.scale(f);
    },
};
const MoreJson = {
    point: {
        to: (p) => ({ x: p.x, y: p.y }),
        from: (json) => new Point(json.x, json.y),
    },
    vec: {
        to: (v) => ({ x: v.x, y: v.y }),
        from: (json) => new Vec(json.x, json.y),
    },
    amount: {
        to: (a) => ({ value: a.value, unit: a.unit }),
        from: (json) => new Amount(json.value, json.unit),
    },
    position: {
        to: (p) => ({
            x: p.get(p.space).x,
            y: p.get(p.space).y,
            space: p.space,
            unit: MoreJsonUtil.unitsFor(p),
        }),
        from: (json) => MoreJsonUtil.fromUnits(Position(new Point(json.x, json.y), json.space), json.unit),
    },
    vector: {
        to: (v) => ({
            x: v.get(v.space).x,
            y: v.get(v.space).y,
            space: v.space,
            unit: MoreJsonUtil.unitsFor(v),
        }),
        from: (json) => MoreJsonUtil.fromUnits(Vector(new Vec(json.x, json.y), json.space), json.unit),
    },
    angle: {
        to: (a) => ({
            angle: a.get(a.space),
            space: a.space,
        }),
        from: (json) => Angle(Radians(json.angle), json.space),
    },
    distance: {
        to: (d) => ({
            d: d.get(d.space),
            space: d.space,
            unit: MoreJsonUtil.unitsFor(d),
        }),
        from: (json) => MoreJsonUtil.fromUnits(Distance(json.d, json.space), json.unit),
    },
};
"use strict";
class ImageExporter {
    constructor() {
        this.readyListener = ImageExporter.NOOP;
    }
    setup() {
        App.renderReady.onChange(ready => {
            if (ready) {
                this.readyListener();
                this.readyListener = ImageExporter.NOOP;
            }
        });
    }
    onReady(f) {
        if (App.renderReady.get()) {
            f();
            this.readyListener = ImageExporter.NOOP;
            return;
        }
        this.readyListener = f;
    }
    export() {
        App.renderReady.set(false);
        App.rendering.set(true);
        const canvases = Array.from(App.pane.children)
            .filter(c => c.tagName.toLocaleLowerCase() === 'canvas')
            .map(c => c);
        const first = canvases[0];
        const compositing = document.createElement('canvas');
        compositing.width = first.width;
        compositing.height = first.height;
        compositing.style.width = `${first.width}px`;
        compositing.style.height = `${first.height}px`;
        compositing.style.opacity = '0';
        compositing.style.position = 'absolute';
        compositing.style.pointerEvents = 'none';
        this.onReady(() => {
            const dataUrls = canvases.map(c => c.toDataURL('image/png'));
            const loaded = new Array(dataUrls.length).fill(false);
            const images = [];
            const renderComposite = () => {
                App.rendering.set(false);
                document.body.prepend(compositing);
                const g = compositing.getContext('2d');
                g.fillStyle = 'white';
                g.fillRect(0, 0, compositing.width + 1, compositing.height + 1);
                const renderImages = (layer) => {
                    const imgComponents = App.ecs.getComponents(Imaged)
                        .filter(img => img.layer === layer);
                    imgComponents.sort((a, b) => a.zindex - b.zindex);
                    imgComponents.forEach(m => {
                        const pos = m.center.get('screen');
                        const width = m.width.get('screen');
                        const height = m.height.get('screen');
                        const angle = unwrap(m.rotation.get('screen'));
                        const t = g.getTransform();
                        g.translate(pos.x, pos.y);
                        g.rotate(angle);
                        g.globalAlpha = m.opacity.get();
                        try {
                            g.drawImage(m.image, -width / 2, -height / 2, width, height);
                        }
                        catch (e) {
                            console.error(`error rendering a ${layer} image:`, e);
                        }
                        g.setTransform(t);
                        g.globalAlpha = 1;
                    });
                };
                renderImages('reference');
                for (let i = 0; i < images.length; i++) {
                    const canvasImage = images[i];
                    g.drawImage(canvasImage, 0, 0, canvasImage.width, canvasImage.height);
                    if (i === 0) {
                        renderImages('furniture');
                    }
                }
                App.io.download('drawall-floor-plan.png', compositing.toDataURL('image/png'));
                document.body.removeChild(compositing);
            };
            dataUrls.forEach((url, i) => {
                const image = new Image();
                image.onload = () => {
                    loaded[i] = true;
                    if (loaded.every(b => b)) {
                        renderComposite();
                    }
                };
                image.src = url;
                images.push(image);
            });
        });
    }
}
ImageExporter.NOOP = () => { };
"use strict";
var _a;
const Eid = newtype();
const Cid = newtype();
const SOLO = Symbol();
class Component {
    constructor(entity) {
        this.entity = entity;
        this.kinds = new Set();
        this.nameRef = Refs.of(`${this.constructor.name} ${Component.counter.inc(this.constructor.name)}`);
        this.id = Cid(Component.idCount++);
        this.nameRef.onChange(n => {
            App.project.requestSave(`component renamed to '${n}'`);
        });
    }
    get name() {
        return this.nameRef.get();
    }
    set name(n) {
        this.nameRef.set(n);
    }
    addKind(c) {
        this.kinds.add(c);
    }
    getKinds() {
        const result = new Set(this.kinds);
        result.add(this.constructor);
        return Array.from(result);
    }
    tearDown() {
    }
    ref() {
        return this.entity.ref((_) => this);
    }
    toJson() {
        return null;
    }
    static resetCounters() {
        this.counter.clear();
    }
}
Component.idCount = 0;
Component.counter = new Counter();
class TestComponent extends Component {
    constructor() {
        super(...arguments);
        this[_a] = true;
    }
}
_a = SOLO;
class ComponentMap {
    constructor(enforceSolo = true) {
        this.enforceSolo = enforceSolo;
        // map of component class constructors to component instances
        this.map = new Map();
    }
    add(c) {
        if (this.enforceSolo
            && SOLO in c
            && this.has(c.constructor)) {
            // NB: only applies solo constraint on the subclass type
            return false;
        }
        for (const key of c.getKinds()) {
            this._add(key, c);
        }
        return true;
    }
    _add(key, c) {
        if (!this.map.has(key)) {
            this.map.set(key, new Set([c]));
        }
        else {
            const set = this.map.get(key);
            set.add(c);
            this.map.get(key).add(c);
        }
    }
    get(kind) {
        const set = this.map.get(kind);
        if (typeof set === 'undefined') {
            return [];
        }
        return Array.from(set).map(c => c);
    }
    getOrCreate(kind, entity) {
        const set = this.map.get(kind);
        if (typeof set === 'undefined' || set.size === 0) {
            const c = new kind(entity);
            this.map.set(kind, new Set([c]));
            return c;
        }
        return Array.from(set)[0];
    }
    has(kind) {
        return this.map.has(kind) && this.map.get(kind).size > 0;
    }
    hasInstance(c) {
        const kind = c.constructor;
        return this.map.has(kind) && this.map.get(kind).has(c);
    }
    remove(c) {
        let removedAny = false;
        for (const key of c.getKinds()) {
            const set = this.map.get(key);
            if (typeof set === 'undefined' || !set.has(c)) {
                continue;
            }
            set.delete(c);
            removedAny = true;
        }
        return removedAny;
    }
    removeAll(kind) {
        const set = this.get(kind);
        if (set === null)
            return [];
        const arr = Array.from(set).map(c => c);
        arr.forEach(c => this.remove(c));
        return arr;
    }
    keys() {
        return new Set(this.map.keys());
    }
}
class Entity {
    constructor(ecs, id) {
        this.ecs = ecs;
        this.id = id;
        this.components = new ComponentMap(true);
        this.destroyed = false;
        this.name = '';
    }
    add(kind, ...args) {
        const c = new kind(this, ...args);
        return this._add(c);
    }
    get isDestroyed() {
        return this.destroyed;
    }
    get isAlive() {
        return !this.destroyed;
    }
    _add(c) {
        if (c.entity.id !== this.id) {
            throw new Error(`Cannot add ${c.entity.id}'s component to entity ${this.id}!`);
        }
        if (!this.components.add(c)) {
            // is solo component, return previous instance.
            return this.components.get(c.constructor)[0];
        }
        this.ecs.registerComponent(c);
        return c;
    }
    remove(c) {
        if (this.components.remove(c)) {
            c.tearDown();
            this.ecs.removeComponent(c);
            return true;
        }
        return false;
    }
    removeAll(kind) {
        const arr = this.components.removeAll(kind);
        for (const c of arr) {
            c.tearDown();
            this.ecs.removeComponent(c);
        }
        return arr;
    }
    destroy() {
        if (this.destroyed)
            return;
        this.destroyed = true;
        const kinds = this.components.keys();
        kinds.forEach(c => this.removeAll(c));
        this.ecs.deleteEntity(this.id);
    }
    has(kind) {
        return this.components.get(kind).length > 0;
    }
    get(kind) {
        return this.components.get(kind);
    }
    getRef(kind) {
        return this.ref(e => e.get(kind));
    }
    only(kind) {
        const arr = this.get(kind);
        if (arr.length !== 1) {
            throw new Error(`Expected exactly one of ${kind} on ${this}!`);
        }
        return arr[0];
    }
    maybe(kind) {
        const arr = this.get(kind);
        if (arr.length !== 1) {
            return null;
        }
        return arr[0];
    }
    onlyRef(kind) {
        return this.ref(e => e.only(kind));
    }
    getOrCreate(kind, ...args) {
        if (this.has(kind)) {
            return this.get(kind)[0];
        }
        return this.add(kind, ...args);
    }
    ref(f) {
        return EntityRef(f, this);
    }
    toString() {
        return `Entity(id=${this.id}, name=${this.name})`;
    }
    toJson() {
        const components = [];
        for (const key of this.components.keys()) {
            for (const component of this.components.get(key)) {
                const saved = component.toJson();
                if (saved !== null) {
                    components.push(Object.assign(Object.assign({}, saved), { name: component.name }));
                }
            }
        }
        return {
            id: unwrap(this.id),
            name: this.name,
            components,
        };
    }
}
class EntityRefImpl {
    constructor(getter, entities) {
        this.getter = getter;
        if (typeof entities === 'function') {
            this._entities = entities;
        }
        else {
            this._entities = () => entities;
        }
    }
    get entities() {
        return this._entities();
    }
    get isAlive() {
        return this.entities.every(e => e.isAlive);
    }
    or(x) {
        if (this.isAlive) {
            return this.getter();
        }
        return x;
    }
    unwrap() {
        if (!this.isAlive)
            return null;
        return this.getter();
    }
    map(f) {
        return new EntityRefImpl(() => f(this.getter()), this.entities);
    }
    flatMap(f) {
        const collectEntities = () => {
            const results = new Set(this.entities);
            return Array.from(results);
        };
        return new EntityRefImpl(() => f(this.getter()).unwrap(), () => [...this.entities, ...(this.isAlive ? f(this.getter()).entities : [])]);
    }
    and(e) {
        return new EntityRefImpl(() => [this.getter(), e.getter()], [...this.entities, ...e.entities]);
    }
    with(f) {
        if (this.isAlive) {
            f(this.getter());
        }
    }
}
const EntityRef = (getter, ...entities) => {
    return new EntityRefImpl(() => getter(...entities), entities);
};
class ComponentFactories {
    static register(component, factory) {
        const name = component.name;
        if (ComponentFactories.map.has(name)) {
            throw new Error(`Already have a factory for '${name}'.`);
        }
        ComponentFactories.map.set(name, factory);
    }
    static inflate(entity, name, args) {
        const factory = ComponentFactories.map.get(name);
        if (!factory) {
            throw new Error(`No component factory named '${name}'`);
        }
        return factory(entity, ...args);
    }
}
ComponentFactories.map = new Map();
class EntityComponentSystem {
    constructor() {
        this.entities = new Map();
        this.components = new ComponentMap(false);
        this.systems = [];
        this.nextEid = 0;
    }
    deleteEntity(e) {
        const entity = this.entities.get(e);
        if (typeof entity === 'undefined') {
            return;
        }
        this.entities.delete(e);
        entity.destroy();
        App.project.requestSave('entity deleted');
    }
    createEntity(...components) {
        const e = new Entity(this, Eid(this.nextEid++));
        this.entities.set(e.id, e);
        for (const c of components) {
            e.add(c);
        }
        App.project.requestSave('entity created');
        return e;
    }
    getEntity(e) {
        return this.entities.get(e) || null;
    }
    getComponents(kind) {
        return this.components.get(kind).filter(c => !c.entity.isDestroyed);
    }
    registerComponent(c) {
        this.components.add(c);
    }
    removeComponent(c) {
        if (!this.components.remove(c)) {
            return;
        }
        c.entity.remove(c);
    }
    registerSystem(s) {
        this.systems.push(s);
    }
    update() {
        for (const s of this.systems) {
            s(this);
        }
    }
    get entityCount() {
        return this.entities.size;
    }
    deleteEverything() {
        const entities = [...this.entities.values()];
        entities.forEach(e => e.destroy());
        Component.resetCounters();
        this.nextEid = 0;
    }
    toJson() {
        const entities = [];
        for (const e of this.entities.values()) {
            if (!e.isAlive)
                continue;
            const saved = e.toJson();
            if (saved.components.length > 0) {
                entities.push(saved);
            }
        }
        return {
            nextEid: this.nextEid,
            entities,
        };
    }
    loadJson(ecs) {
        App.history.suspendWhile(() => this._doLoadJson(ecs));
    }
    _doLoadJson(ecs) {
        this.nextEid = Math.max(this.nextEid, ecs.nextEid);
        const toInflate = [];
        for (const savedEntity of ecs.entities) {
            const existing = this.entities.get(Eid(savedEntity.id));
            if (existing) {
                // allows updating in-place for e.g. undo-redo functionality
                existing.destroy();
            }
            const e = new Entity(this, Eid(savedEntity.id));
            e.name = savedEntity.name;
            this.entities.set(e.id, e);
            for (const savedComponent of savedEntity.components) {
                toInflate.push([e, savedComponent]);
            }
        }
        const describe = (entity, comp) => `${entity.id}<-'${comp.name}' ${comp.factory}(${JSON.stringify(comp.arguments)})`;
        let futile = false;
        while (!futile && toInflate.length > 0) {
            futile = true;
            const tryAgain = [];
            while (toInflate.length > 0) {
                const item = toInflate.pop();
                const [entity, savedComponent] = item;
                const result = ComponentFactories.inflate(entity, savedComponent.factory, savedComponent.arguments);
                if (result === 'not ready') {
                    tryAgain.push(item);
                    continue;
                }
                if (result === 'skip') {
                    App.log('SKIP', describe(entity, savedComponent));
                    continue;
                }
                result.name = savedComponent.name;
                App.log('LOAD', describe(entity, savedComponent));
                // made progress
                futile = false;
            }
            tryAgain.forEach(item => toInflate.push(item));
        }
        if (toInflate.length > 0) {
            App.log('failed to inflate', toInflate.length, 'components.');
            for (const [entity, component] of toInflate) {
                App.log('FAIL', describe(entity, component));
            }
        }
        this.nextEid = [...this.entities.keys()]
            .map(e => unwrap(e))
            .reduce((a, b) => Math.max(a, b), 0);
    }
}
"use strict";
// ui controls like buttons n stuff
class ElementWrap {
    constructor(element) {
        this.element = element;
    }
    get classes() {
        const name = this.element.getAttribute('class');
        if (!name)
            return new Set();
        return new Set(name.trim().split(/[ ]+/));
    }
    set classes(names) {
        this.element.setAttribute('class', Array.from(names).join(' '));
    }
    addClass(name) {
        const set = this.classes;
        if (set.has(name))
            return;
        set.add(name);
        this.classes = set;
    }
    removeClass(name) {
        const set = this.classes;
        if (!set.has(name))
            return;
        set.delete(name);
        this.classes = set;
    }
    setEnabled(enabled) {
        if (enabled) {
            this.removeClass('disabled');
        }
        else {
            this.addClass('disabled');
        }
    }
    setHidden(hidden) {
        if (hidden) {
            this.addClass('hidden');
        }
        else {
            this.removeClass('hidden');
        }
    }
    set tooltip(text) {
        this.element.setAttribute('title', text);
    }
    onClick(listener) {
        this.element.addEventListener('click', () => {
            if (this.classes.has('disabled'))
                return;
            listener();
        });
    }
}
class IconButton extends ElementWrap {
    constructor(name, icon = null) {
        super(document.createElement('a'));
        this.name = name;
        this.element.setAttribute('href', '#');
        this.tooltip = name;
        this.classes = new Set(['icon-button']);
        this.icon = icon;
    }
    onClick(listener) {
        this.element.addEventListener('click', () => listener());
    }
    set selected(selected) {
        if (selected) {
            this.addClass('selected');
        }
        else {
            this.removeClass('selected');
        }
    }
    set icon(url) {
        if (url === null) {
            this.element.style.backgroundImage = '';
            this.element.innerHTML = this.name.charAt(0).toLocaleUpperCase()
                + this.name.charAt(1).toLocaleLowerCase();
            return;
        }
        this.element.style.backgroundImage = `url('${url}')`;
        this.element.innerHTML = '';
    }
}
class AutoForm {
    constructor() {
        this.fields = new Array();
        this.fieldDefs = new Map();
        this.uiMap = new Map();
        this.handles = new DefaultMap(() => new Set());
        this.downstream = new Set();
    }
    has(field) {
        return this.fieldDefs.has(AutoForm.fieldId(field));
    }
    addSeparator() {
        this.add({
            name: `${AutoForm.rulerCount++}`,
            kind: 'separator',
            value: Refs.of('separator'),
        });
    }
    addButton(field) {
        return this.add(Object.assign(Object.assign({}, field), { kind: 'button', value: Refs.of('button') }));
    }
    addSelect(field) {
        return this.add(Object.assign(Object.assign({}, field), { kind: 'select' }));
    }
    add(field) {
        this.addFieldDef(field);
        const id = AutoForm.fieldId(field);
        const handle = {
            value: field.value,
            enabled: field.enabled || Refs.of(true),
            hidden: field.hidden || Refs.of(false),
        };
        handle.value.onChange(_ => this.updateUi(field));
        handle.enabled.onChange(_ => this.updateUi(field));
        handle.hidden.onChange(_ => this.updateUi(field));
        this.handles.get(id).add(handle);
        return handle;
    }
    inflate(into) {
        const form = into || new MiniForm();
        form.verticalAlign = 'stretch';
        for (const field of this.fields) {
            const inflated = this.inflateField(field);
            inflated.element.tooltip = field.tooltip || field.label || field.name;
            const id = AutoForm.fieldId(field);
            this.uiMap.set(id, inflated);
            this.updateUi(field);
            if (field.label) {
                const wrapped = form.appendLabeled(field.label, inflated.element);
                for (const handle of this.handles.get(id)) {
                    handle.enabled.onChange(e => wrapped.setEnabled(e));
                    handle.hidden.onChange(e => wrapped.setHidden(e));
                    wrapped.setEnabled(handle.enabled.get());
                    wrapped.setHidden(handle.hidden.get());
                }
            }
            else {
                form.append(inflated.element);
            }
        }
        return form;
    }
    addFieldDef(field) {
        if (field.kind === 'separator'
            && this.fields.length > 0
            && this.fields[this.fields.length - 1].kind === 'separator') {
            // elide repeatedly added separators
            return;
        }
        const id = AutoForm.fieldId(field);
        if (!this.fieldDefs.has(id)) {
            this.fieldDefs.set(id, field);
            this.fields.push(field);
        }
    }
    updateUi(field) {
        for (const down of this.downstream) {
            down.updateUi(field);
        }
        const id = AutoForm.fieldId(field);
        if (!this.uiMap.has(id))
            return;
        const ui = this.uiMap.get(id);
        const values = new Set();
        const enables = new Set();
        const hiddens = new Set();
        for (const handle of this.handles.get(id)) {
            values.add(handle.value.get());
            enables.add(handle.enabled.get());
            hiddens.add(handle.hidden.get());
        }
        if (values.size === 1) {
            ui.setValue(Array.from(values)[0]);
        }
        else {
            ui.clear();
        }
        ui.setEnabled(Array.from(enables).some(e => e));
        ui.setHidden(Array.from(hiddens).some(e => e));
    }
    updateHandle(field, value) {
        for (const handle of this.handles.get(AutoForm.fieldId(field))) {
            handle.value.set(value);
        }
    }
    inflateField(field) {
        var _a;
        if (field.kind === 'amount') {
            const input = new AmountInput();
            input.minValue = typeof field.min !== 'undefined' ? field.min : null;
            input.maxValue = typeof field.max !== 'undefined' ? field.max : null;
            input.onChange(value => this.updateHandle(field, value));
            return {
                element: input,
                setValue: v => input.setValue(v),
                clear: () => input.clear(),
                setEnabled: e => input.setEnabled(e),
                setHidden: h => input.setHidden(h),
            };
        }
        if (field.kind === 'distance') {
            const input = new AmountInput();
            const d2a = (d) => App.project.displayUnit.from(App.project.modelUnit.newAmount(d.get('model')));
            const a2d = (a) => Distance(App.project.modelUnit.from(a).value, 'model');
            input.minValue = typeof field.min !== 'undefined' ? d2a(field.min) : null;
            input.maxValue = typeof field.max !== 'undefined' ? d2a(field.max) : null;
            input.onChange(value => this.updateHandle(field, a2d(value)));
            return {
                element: input,
                setValue: v => input.setValue(d2a(v)),
                clear: () => input.clear(),
                setEnabled: e => input.setEnabled(e),
                setHidden: h => input.setHidden(h),
            };
        }
        if (field.kind === 'slider') {
            const input = new SliderInput(field.min, field.max);
            input.onChange(value => this.updateHandle(field, value));
            return {
                element: input,
                setValue: v => input.setValue(v),
                clear: () => input.clear(),
                setEnabled: e => input.setEnabled(e),
                setHidden: h => input.setHidden(h),
            };
        }
        if (field.kind === 'angle') {
            const input = new AngleInput();
            input.onChange(value => this.updateHandle(field, value));
            return {
                element: input,
                setValue: v => input.setValue(v),
                clear: () => input.clear(),
                setEnabled: e => input.setEnabled(e),
                setHidden: h => input.setHidden(h),
            };
        }
        if (field.kind === 'text') {
            const input = new TextInput();
            input.onChange(value => this.updateHandle(field, value));
            return {
                element: input,
                setValue: v => input.setValue(v),
                clear: () => input.clear(),
                setEnabled: e => input.setEnabled(e),
                setHidden: h => input.setHidden(h),
            };
        }
        if (field.kind === 'number') {
            const input = new NumberInput(typeof field.min !== 'undefined' ? field.min : null, typeof field.max !== 'undefined' ? field.max : null);
            input.onChange(value => this.updateHandle(field, value));
            return {
                element: input,
                setValue: v => input.setValue(v),
                clear: () => input.clear(),
                setEnabled: e => input.setEnabled(e),
                setHidden: h => input.setHidden(h),
            };
        }
        if (field.kind === 'toggle') {
            const input = new ToggleButton(field.name, field.icons);
            input.onToggle(value => this.updateHandle(field, value));
            return {
                element: input,
                setValue: v => input.setToggled(v),
                clear: () => input.clear(),
                setEnabled: e => input.setEnabled(e),
                setHidden: h => input.setHidden(h),
            };
        }
        if (field.kind === 'select') {
            const defaultIcon = (_a = field.items
                .filter(m => m.value === field.value.get())[0]) === null || _a === void 0 ? void 0 : _a.icon;
            const input = new IconButton(field.name, defaultIcon);
            input.addClass('selected');
            const popstate = {};
            input.onClick(() => {
                var _a, _b;
                if ((_a = popstate.popup) === null || _a === void 0 ? void 0 : _a.isAlive) {
                    (_b = popstate.popup) === null || _b === void 0 ? void 0 : _b.destroy();
                    return;
                }
                const popup = App.ecs.createEntity().add(Popup);
                popstate.popup = popup.entity;
                const subform = new AutoForm();
                field.items.forEach(item => {
                    subform.addButton({
                        name: item.label || item.value,
                        icon: item.icon,
                        onClick: () => {
                            this.updateHandle(field, item.value);
                            popup.entity.destroy();
                        }
                    });
                });
                const bounds = input.element.getBoundingClientRect();
                popup.setAnchor({
                    position: Position(new Point(bounds.left, bounds.top + bounds.height), 'screen'),
                    halign: 'left',
                    valign: 'top',
                    onCanvas: false,
                });
                const mini = new MiniForm();
                mini.layout = 'column';
                subform.inflate(mini);
                popup.element.appendChild(mini.element);
                popup.show();
                mini.element.addEventListener('mouseleave', () => {
                    popstate.reentered = false;
                    setTimeout(() => {
                        if (!popstate.reentered) {
                            popup.entity.destroy();
                        }
                    }, 1000);
                });
                mini.element.addEventListener('mouseenter', () => {
                    popstate.reentered = true;
                });
            });
            return {
                element: input,
                setValue: v => {
                    var _a;
                    input.icon = ((_a = field.items.filter(m => m.value === v)[0]) === null || _a === void 0 ? void 0 : _a.icon) || null;
                },
                clear: () => { },
                setEnabled: e => input.setEnabled(e),
                setHidden: h => input.setHidden(h),
            };
        }
        if (field.kind === 'button') {
            const input = new IconButton(field.name, field.icon);
            input.onClick(field.onClick);
            return {
                element: input,
                setValue: (_) => { },
                clear: () => { },
                setEnabled: e => input.setEnabled(e),
                setHidden: h => input.setHidden(h),
            };
        }
        if (field.kind === 'separator') {
            const element = new Separator(true);
            return {
                element,
                setValue: (_) => { },
                clear: () => { },
                setEnabled: (_) => { },
                setHidden: h => element.setHidden(h),
            };
        }
        return impossible(field);
    }
    static intersection(forms) {
        AutoForm.sortForms(forms);
        if (forms.length === 0)
            return new AutoForm();
        if (forms.length === 1)
            return forms[0];
        const [first, ...remainder] = forms;
        const included = new Set(first.fields.map(AutoForm.fieldId));
        for (const form of remainder) {
            const check = Array.from(included);
            for (const field of check) {
                if (!form.fieldDefs.has(field)) {
                    included.delete(field);
                }
            }
            if (included.size === 0)
                break;
        }
        const result = new AutoForm();
        for (const field of first.fields) {
            const id = AutoForm.fieldId(field);
            if (included.has(id)) {
                result.addFieldDef(field);
                for (const form of forms) {
                    for (const handle of form.handles.get(id)) {
                        result.handles.get(id).add(handle);
                    }
                }
            }
        }
        for (const form of forms) {
            form.downstream.add(result);
        }
        return result;
    }
    static union(forms) {
        AutoForm.sortForms(forms);
        const result = new AutoForm();
        for (const form of forms) {
            if (result.fields.length > 0) {
                result.addSeparator();
            }
            for (const field of form.fields) {
                result.addFieldDef(field);
                const id = AutoForm.fieldId(field);
                for (const handle of form.handles.get(id)) {
                    result.handles.get(id).add(handle);
                }
            }
            form.downstream.add(result);
        }
        return result;
    }
    static fieldId(field) {
        return `${field.kind}:${field.name}`;
    }
    static sortForms(forms) {
        forms.sort((a, b) => {
            const cmpLen = a.fields.length - b.fields.length;
            if (cmpLen !== 0)
                return cmpLen;
            for (let i = 0; i < a.fields.length; i++) {
                const c = a.fields[i].name.localeCompare(b.fields[i].name);
                if (c !== 0)
                    return c;
            }
            return 0;
        });
    }
}
AutoForm.rulerCount = 0;
class MiniForm extends ElementWrap {
    constructor(element) {
        super(element || document.createElement('div'));
        this._layout = 'row';
        this.children = new Set();
        this.addClass('mini-form');
        this.layout = 'row';
        this.horizontalAlign = 'flex-start';
        this.verticalAlign = 'center';
    }
    set layout(direction) {
        if (direction === this._layout)
            return;
        this._layout = direction;
        this.element.style.flexDirection = direction;
    }
    get layout() {
        return this._layout;
    }
    set horizontalAlign(align) {
        if (this.layout === 'row') {
            this.element.style.justifyContent = align;
        }
        else {
            this.element.style.alignItems = align;
        }
    }
    set verticalAlign(align) {
        if (this.layout === 'column') {
            this.element.style.justifyContent = align;
        }
        else {
            this.element.style.alignItems = align;
        }
    }
    reset() {
        this.children.forEach(c => c.reset());
    }
    clear() {
        this.element.innerHTML = '';
        this.children.clear();
    }
    append(e) {
        if ('reset' in e && typeof e.reset === 'function') {
            this.children.add(e);
        }
        if ('element' in e) {
            this.element.appendChild(e.element);
        }
    }
    appendSpacer() {
        const spacer = document.createElement('div');
        spacer.setAttribute('class', 'spacer');
        this.element.appendChild(spacer);
    }
    appendRuler() {
        const ruler = document.createElement('div');
        ruler.setAttribute('class', this.layout === 'row' ? 'h-ruler' : 'v-ruler');
        this.element.appendChild(ruler);
    }
    appendLabeled(text, e) {
        const label = new MiniLabel(text.toLocaleUpperCase());
        label.addClass('over-label');
        const column = new MiniForm();
        column.layout = 'column';
        column.append(label);
        column.append(e);
        this.append(column);
        return column;
    }
}
class Separator extends ElementWrap {
    constructor(horizontal) {
        super(document.createElement('div'));
        this.addClass(horizontal ? 'h-ruler' : 'v-ruler');
    }
}
class MiniLabel extends ElementWrap {
    constructor(text) {
        super(document.createElement('label'));
        this.text = text;
    }
    set text(text) {
        this.element.innerHTML = text;
    }
}
;
;
class MiniFormInput extends ElementWrap {
    constructor(element) {
        super(element);
        this.changeListeners = new Set();
        this.addClass('mini-form-input');
        this.bindChangeListener(() => {
            if (this.getRawValue() === '') {
                return;
            }
            const value = this.getValue();
            if (value === null) {
                return;
            }
            for (const item of this.changeListeners) {
                item(value);
            }
            const formatted = this.format(value);
            if (formatted !== this.getRawValue()) {
                this.setRawValue(formatted);
            }
        });
    }
    onChange(listener) {
        this.changeListeners.add(listener);
    }
    getValue() {
        const parse = this.parse(`${this.getRawValue()}`);
        if ('error' in parse) {
            this.tooltip = parse.error;
            this.addClass('error');
            return null;
        }
        this.tooltip = '';
        this.removeClass('error');
        return parse.value;
    }
    clear() {
        this.setRawValue('');
    }
    reset() {
        this.clear();
    }
    setValue(value) {
        if (this.element === document.activeElement) {
            return; // don't clobber input while ppl r trying to type
        }
        this.setRawValue(this.format(value));
    }
    format(value) {
        return `${value}`;
    }
    bindChangeListener(handle) {
        this.element.addEventListener('change', () => handle());
    }
}
class SliderInput extends MiniFormInput {
    constructor(minValue, maxValue) {
        super(document.createElement('input'));
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.addClass('mini-slider');
        this.element.setAttribute('type', 'range');
        this.element.setAttribute('min', '0');
        this.element.setAttribute('max', `${SliderInput.RESOLUTION}`);
    }
    getRawValue() {
        return this.element.value;
    }
    setRawValue(value) {
        this.element.value = value;
    }
    format(value) {
        const min = this.minValue;
        const max = this.maxValue;
        const v = lerp((1.0 * value - min) / (max - min), 0, SliderInput.RESOLUTION);
        return `${v}`;
    }
    parse(input) {
        const amount = parseFloat(input);
        if (amount === null) {
            return { error: `Could not parse '${input}'` };
        }
        return { value: lerp(amount / SliderInput.RESOLUTION, this.minValue, this.maxValue) };
    }
}
SliderInput.RESOLUTION = 10000;
class AmountInput extends MiniFormInput {
    constructor() {
        super(document.createElement('input'));
        this.minValue = null;
        this.maxValue = null;
        this.lastUnit = null;
        this.addClass('amount');
        this.element.setAttribute('type', 'text');
        this.element.setAttribute('size', '8');
        App.project.displayUnitRef.onChange(unit => {
            const value = this.getValue();
            if (value !== null) {
                this.setRawValue(this.format(value));
            }
        });
    }
    getRawValue() {
        return this.element.value;
    }
    setRawValue(value) {
        this.element.value = value;
    }
    format(value) {
        const formatted = App.project.displayUnit.format(value);
        // for feet & inches in particular, we can end up getting
        // a different unit here than just the display unit.
        this.lastUnit = Units.distance.get(Units.distance.parse(formatted).unit);
        return formatted;
    }
    parse(input) {
        const raw = Units.distance.parse(input.trim());
        if (raw === null) {
            return { error: `Could not parse '${input}'` };
        }
        const amount = raw.unit === UNITLESS ? this.inferUnit(raw.value) : raw;
        this.lastUnit = Units.distance.get(amount.unit);
        const au = Units.distance.get(amount.unit);
        const min = this.minValue;
        const max = this.maxValue;
        if (min !== null && amount.value < au.from(min).value)
            return { value: min };
        if (max !== null && amount.value > au.from(max).value)
            return { value: max };
        return { value: amount };
    }
    inferUnit(value) {
        if (this.lastUnit !== null) {
            return this.lastUnit.newAmount(value);
        }
        return App.project.displayUnit.newAmount(value);
    }
}
class AngleInput extends MiniFormInput {
    constructor() {
        super(document.createElement('input'));
        this.minValue = null;
        this.maxValue = null;
        this.element.setAttribute('type', 'text');
        this.element.setAttribute('size', '6');
        this.addClass('angle');
    }
    getRawValue() {
        return this.element.value;
    }
    setRawValue(value) {
        this.element.value = value;
    }
    format(value) {
        const radians = value.get('model');
        const degrees = toDegrees(radians);
        return `${Math.round(unwrap(degrees) * 10) / 10.}°`;
    }
    parse(input) {
        const degrees = parseFloat(input.trim().replace(/°/g, ''));
        if (isNaN(degrees)) {
            return { 'error': `cannot parse '${input}' as a number.` };
        }
        const radians = toRadians(Degrees(degrees));
        const angle = Angle(radians, 'model');
        const min = this.minValue;
        const max = this.maxValue;
        if (min !== null && angle.lt(min))
            return { value: min };
        if (max !== null && angle.gt(max))
            return { value: max };
        return { value: angle };
    }
}
class NumberInput extends MiniFormInput {
    constructor(minValue = null, maxValue = null) {
        super(document.createElement('input'));
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.element.setAttribute('type', 'number');
        this.element.setAttribute('size', '6');
        if (minValue !== null) {
            this.element.setAttribute('min', minValue.toString());
        }
        if (maxValue !== null) {
            this.element.setAttribute('max', maxValue.toString());
        }
    }
    getRawValue() {
        return this.element.value;
    }
    setRawValue(value) {
        this.element.value = value;
    }
    format(value) {
        return `${value}`;
    }
    parse(input) {
        const value = parseFloat(input.trim());
        if (isNaN(value)) {
            return { 'error': `cannot parse '${input}' as a number.` };
        }
        const [min, max] = [this.minValue, this.maxValue];
        if (min !== null && value < min)
            return { value: min };
        if (max !== null && value > max)
            return { value: max };
        return { value };
    }
}
class TextInput extends MiniFormInput {
    constructor() {
        super(document.createElement('div'));
        this.addClass('textbox-wrap');
        this.input = document.createElement('input');
        this.input.setAttribute('type', 'text');
        this.label = document.createElement('label');
        this.element.appendChild(this.label);
        this.input.addEventListener('blur', () => {
            this.element.removeChild(this.input);
            this.element.appendChild(this.label);
        });
        this.label.addEventListener('click', () => {
            this.element.removeChild(this.label);
            this.element.appendChild(this.input);
            this.input.focus();
        });
    }
    getRawValue() {
        return this.input.value;
    }
    setRawValue(value) {
        this.input.value = value;
        this.label.innerHTML = value;
    }
    format(value) {
        return `${value}`;
    }
    parse(input) {
        const value = input.trim();
        return { value };
    }
    bindChangeListener(handle) {
        setTimeout(() => {
            this.input.addEventListener('change', () => handle());
        }, 1);
    }
}
class ToggleButton extends IconButton {
    constructor(name, icons) {
        super(name, icons === null || icons === void 0 ? void 0 : icons.off);
        this.icons = icons;
        this.listeners = new Array();
        this._status = false;
        this.addClass('toggle-button');
        this.onClick(() => this.toggle());
    }
    clear() {
        // specifically avoiding firing events.
        this._status = false;
        this.removeClass('selected');
    }
    onToggle(listener) {
        this.listeners.push(listener);
    }
    get toggled() {
        return this._status;
    }
    toggle() {
        this.setToggled(!this._status);
    }
    setToggled(on) {
        var _a, _b;
        if (on === this._status)
            return;
        this._status = on;
        if (on) {
            this.addClass('selected');
            this.icon = ((_a = this.icons) === null || _a === void 0 ? void 0 : _a.on) || null;
        }
        else {
            this.removeClass('selected');
            this.icon = ((_b = this.icons) === null || _b === void 0 ? void 0 : _b.off) || null;
        }
        this.listeners.forEach(listener => listener(on));
    }
}
"use strict";
class GUI {
    constructor() {
        this.topbar = new MiniForm(Array.from(document.getElementsByClassName('topbar'))
            .map(t => t)[0]);
        this.topbar.verticalAlign = 'stretch';
        this.titlebar = new MiniForm(Array.from(document.getElementsByClassName('titlebar'))
            .map(t => t)[0]);
        this.titlebar.verticalAlign = 'stretch';
        this.file = new MiniForm();
        this.selection = new MiniForm();
        this.tool = new MiniForm();
        this.ux = new MiniForm();
        this.project = new MiniForm();
        this.meta = new MiniForm();
        this.title = new MiniForm();
        this.titlebar.append(this.title);
        this.titlebar.appendSpacer();
        this.titlebar.append(this.project);
        this.topbar.appendRuler();
        this.titlebar.append(this.meta);
        this.topbar.append(this.file);
        this.topbar.appendRuler();
        this.topbar.append(this.tool);
        this.topbar.append(this.selection);
        this.topbar.appendSpacer();
        this.topbar.append(this.ux);
    }
    setup() {
        this.setupTitle();
        this.setupFile();
        this.setupUx();
        this.setupProject();
        this.setupMeta();
        this.preloadIcons();
    }
    setupTitle() {
        const form = new AutoForm();
        form.add({
            kind: 'text',
            name: 'projectname',
            value: App.project.projectNameRef,
        });
        form.inflate(this.title);
    }
    setupMeta() {
        const form = new AutoForm();
        form.addButton({
            name: 'About',
            icon: Icons.heartInfo,
            onClick: () => {
                const popup = App.ecs.createEntity().add(PopupWindow);
                popup.setPosition(Position(new Point(App.viewport.screen_width / 2, App.viewport.screen_height / 2), 'screen'));
                popup.title = 'About';
                const rainbow = (text) => {
                    const result = [];
                    for (let i = 0; i < text.length; i++) {
                        const c = text.charAt(i);
                        if (c === ' ') {
                            result.push('<span style="display: inline-block; width: 0.5em;"></span>');
                            continue;
                        }
                        const hue = Math.round(360 * i / text.length);
                        const color = `hsl(${hue}, 100%, 50%)`;
                        result.push(`<span style="
              display: inline-block;
              color: ${color};
            ">${c}</span>`);
                    }
                    return result.join('');
                };
                const content = document.createElement('div');
                content.style.width = '50vw';
                content.style.maxWidth = '50em';
                content.style.maxHeight = 'calc(70vh - 100px)';
                content.style.overflowY = 'scroll';
                content.style.marginBottom = '1ex';
                const inner = document.createElement('div');
                content.appendChild(inner);
                inner.innerHTML = `
          Hi~! This floor plan CAD thingy was made by <a target="blank_" href="https://cohost.org/gwenverbsnouns/">Gwen</a>.
          <p>It's designed to make quick and easy mockups from imprecise measurements—because we've all had the experience of taking a thousand measurements, then trying to draw it up and finding that the inches don't <em>quite</em> add up! Or trying to plan a move based off of vague dimensions provided by a landlord.
          <h4>why did u do this</h4>
          <p>I made it 'cause <span style="text-decoration: line-through; font-size: 0.9em;">it was my project during a manic episode</span> I've moved into a lot of apartments, and I always end up spending wayyyy too much time figuring out how to arrange furniture in applications that are either totally overkill (Sketchup, Blender, OpenSCAD, FreeCAD), or lacking features I wanted. And none of them did a great job of supporting measurements that were a little bit fuzzy!
          <h4>is this rly free???</h4>
          <p>yeah.
          <h4>ok but i feel like it <em>shouldn't</em> be free???</h4>
          <p>If you like this tool and wanna support me and my polycule, feel free to click on <a target="blank_" href="https://ko-fi.com/gwenverbsnouns">this ko-fi link</a>. I'll prolly spend it on getting bubble tea with my gf. My financial situation isn't dire, but I <em>am</em> burned out af and not working rn, which is p stressful at times.
          <h4>privacy?</h4>
          <p>This is a static website; all data is stored locally in your browser. There's not even a backend (backends are expensive), let alone a shadowy database of personal info.
          <h4>i think it's broken</h4>
          <p>Oh no! Please file an issue (or a pull request) over <a target="blank_" href="https://github.com/gmalmquist/drawall">here</a>.
          <h4>what's it made out of?</h4>
          <p>I mean, you can look at the github repo linked above? But I made the icons in <a target="blank_" href="https://inkscape.org">Inkscape</a>, which I adore. I made typescript newtypes for IDs and math stuffs using <a target="blank_" href="https://github.com/kanwren/minewt">this teeny library</a> my girlfriend (whom I also adore) wrote. The rest is mostly just vanilla typescript and html/css bc I thought that would be fun.
          <h4>why is the ui kinda gay</h4>
          <p>${rainbow('idk what ur talking about')}
        `;
                popup.appendHTML(content);
                popup.getUiBuilder()
                    .newRow()
                    .addButton("im done reading now <3", (_) => {
                    popup.entity.destroy();
                });
                popup.show();
                popup.element.style.top = '100px';
            },
        });
        form.inflate(this.meta);
    }
    setupFile() {
        const form = new AutoForm();
        form.addButton({
            name: 'New',
            icon: Icons.newFile,
            onClick: () => App.actions.fire('new'),
        });
        form.addButton({
            name: 'Open',
            icon: Icons.openFile,
            onClick: () => App.actions.fire('open'),
        });
        form.addButton({
            name: 'Save',
            icon: Icons.saveFile,
            onClick: () => App.actions.fire('save'),
        });
        form.addButton({
            name: 'Download Image (Shift+D)',
            icon: Icons.exportImage,
            onClick: () => App.actions.fire('export-png'),
        });
        form.addButton({
            name: 'Undo (Control+z)',
            icon: Icons.editUndo,
            onClick: () => App.actions.fire('undo'),
            enabled: App.history.canUndo,
        });
        form.addButton({
            name: 'Redo (Control+Shift+Z)',
            icon: Icons.editRedo,
            onClick: () => App.actions.fire('redo'),
            enabled: App.history.canRedo,
        });
        form.inflate(this.file);
    }
    setupUx() {
        const form = new AutoForm();
        const snappingSupported = App.tools.currentRef.map({
            to: tool => tool.allowSnap,
            from: _ => App.tools.current,
        });
        const snappingHidden = Refs.negate(Refs.reduce({
            to: ([supported, enabled]) => supported && enabled,
            from: _ => [snappingSupported.get(), App.ui.snapping.enableByDefaultRef.get()],
            compareValues: areEq,
        }, snappingSupported, App.ui.snapping.enableByDefaultRef));
        // not implemented
        //    form.add({
        //      name: 'Local Axes Snapping',
        //      kind: 'toggle',
        //      value: App.ui.snapping.snapToLocalRef,
        //      icons: { on: Icons.snapLocalOn, off: Icons.snapLocalOff },
        //      hidden: snappingHidden,
        //    });
        form.add({
            name: 'Global Axes Snapping',
            kind: 'toggle',
            value: App.ui.snapping.snapToGlobalRef,
            icons: { on: Icons.snapGlobalOn, off: Icons.snapGlobalOff },
            hidden: snappingHidden,
        });
        // not implemented
        //    form.add({
        //      name: 'Geometry Axes Snapping',
        //      kind: 'toggle',
        //      value: App.ui.snapping.snapToGeometryRef,
        //      icons: { on: Icons.snapGeomOn, off: Icons.snapGeomOff },
        //      hidden: snappingHidden,
        //    });
        form.add({
            name: 'Snap to Grid',
            kind: 'toggle',
            value: App.settings.snapGrid,
            icons: { on: Icons.snapGridOn, off: Icons.snapGridOff },
            hidden: snappingHidden,
        });
        form.add({
            name: 'Snapping (Shift + %)',
            kind: 'toggle',
            value: App.ui.snapping.enableByDefaultRef,
            icons: { on: Icons.snapOn, off: Icons.snapOff },
            enabled: snappingSupported,
        });
        form.addSeparator();
        form.addButton({
            name: 'Zoom In',
            onClick: () => App.actions.fire('zoom-in'),
            icon: Icons.zoomIn,
        });
        form.addButton({
            name: 'Zoom Out',
            onClick: () => App.actions.fire('zoom-out'),
            icon: Icons.zoomOut,
        });
        form.addButton({
            name: 'Recenter View (0)',
            onClick: () => App.viewport.recenter(),
            icon: Icons.recenter,
        });
        this.ux.clear();
        form.inflate(this.ux);
    }
    addVisibilityOptions(form) {
        const hideVisibilityOptions = Refs.negate(App.settings.showVisibilityOptions);
        form.add({
            name: 'Show/Hide Grid',
            kind: 'toggle',
            value: App.settings.showGrid,
            icons: { on: Icons.showGrid, off: Icons.hideGrid },
            hidden: hideVisibilityOptions,
        });
        form.add({
            name: 'Show/Hide Guides',
            kind: 'toggle',
            value: App.settings.showGuides,
            icons: { on: Icons.showGuides, off: Icons.hideGuides },
            hidden: hideVisibilityOptions,
        });
        form.add({
            name: 'Show/Hide Lengths',
            kind: 'toggle',
            value: App.settings.showLengths,
            icons: { on: Icons.showLengths, off: Icons.hideLengths },
            hidden: hideVisibilityOptions,
        });
        form.add({
            name: 'Show/Hide Angles',
            kind: 'toggle',
            value: App.settings.showAngles,
            icons: { on: Icons.showAngles, off: Icons.hideAngles },
            hidden: hideVisibilityOptions,
        });
        form.add({
            name: 'Show/Hide Joints',
            kind: 'toggle',
            value: App.settings.showJoints,
            icons: { on: Icons.showJoints, off: Icons.hideJoints },
            hidden: hideVisibilityOptions,
        });
        form.add({
            name: 'Visibility Options',
            kind: 'toggle',
            value: App.settings.showVisibilityOptions,
            icons: { on: Icons.visible, off: Icons.invisible },
        });
    }
    setupProject() {
        const form = new AutoForm();
        this.addVisibilityOptions(form);
        form.addSeparator();
        form.add({
            name: 'Kinematics',
            kind: 'toggle',
            tooltip: 'Kinematic Constraints (k)',
            value: App.settings.kinematics,
            icons: { on: Icons.kinematicsOn, off: Icons.kinematicsOff },
        });
        form.addSeparator();
        const fontSize = form.add({
            name: 'font size',
            label: 'font size',
            kind: 'number',
            min: 4,
            max: 100,
            value: App.settings.fontSizeRef,
        });
        const gridSpacing = form.add({
            name: 'grid spacing',
            label: 'grid spacing',
            kind: 'amount',
            min: Units.distance.parse('1cm'),
            value: App.project.gridSpacingRef,
            unit: Units.distance,
        });
        gridSpacing.value.onChange(spacing => {
            if (spacing.value <= 0) {
                gridSpacing.value.set(App.project.gridSpacing);
                return;
            }
            const unit = Units.distance.get(spacing.unit);
            App.project.gridSpacing = spacing;
            App.project.displayUnit = unit.name === 'inch' ? Units.distance.get('ft') : unit;
        });
        this.project.clear();
        form.inflate(this.project);
    }
    preloadIcons() {
        for (const iconUrl of Object.values(Icons)) {
            const image = new Image();
            image.src = iconUrl.toString();
        }
    }
}
"use strict";
const coallesce = (...items) => {
    for (const item of items) {
        if (typeof item !== 'undefined' && item !== null) {
            return item;
        }
    }
    return undefined;
};
class VectorCanvas {
    constructor(svg) {
        this.cache = new Map();
        this.tagCount = new Counter();
        this.freshIds = new Set();
        this.dirtyIds = new Set();
        this.currentPath = new Array();
        this.root = new SvgElementWrap(svg);
    }
    setup() {
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
    }
    update() {
        this.tagCount.clear();
        this.dirtyIds.forEach(id => {
            var _a;
            if (this.freshIds.has(id)) {
                return;
            }
            const item = this.cache.get(id);
            (_a = item.element.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(item.element);
        });
        this.dirtyIds.clear();
        this.freshIds.forEach(id => this.dirtyIds.add(id));
        this.freshIds.clear();
    }
    rect(rect, style) {
        this.beginPath();
        const [first, ...more] = rect.corners;
        this.moveTo(first);
        for (const c of more) {
            this.lineTo(c);
        }
        this.closePath();
        this.drawPath(style);
    }
    line(a, b, style) {
        this.beginPath();
        this.moveTo(a);
        this.lineTo(b);
        this.drawPath(style);
    }
    beginPath() {
        this.currentPath = [];
    }
    moveTo(p) {
        this.currentPath.push('M');
        this.currentPath.push(this.fmtp(p));
    }
    lineTo(p) {
        this.currentPath.push('L');
        this.currentPath.push(this.fmtp(p));
    }
    closePath() {
        this.currentPath.push('Z');
    }
    drawPath(style) {
        const s = Object.assign(Object.assign({}, VectorCanvas.defaultPathStyle), style);
        const path = this.element('path');
        path.set('d', this.currentPath);
        path.set('fill', s.fill);
        path.set('stroke', s.stroke);
        path.set('stroke-opacity', coallesce(s.strokeOpacity, s.opacity));
        path.set('fill-opacity', coallesce(s.fillOpacity, s.opacity));
        this.render(path);
    }
    text(text) {
        const element = this.element('text');
        element.innerHTML = text.text;
        element.setXY(text.point);
        element.set('stroke', `${text.stroke}`);
        element.set('fill', `${text.fill}`);
        element.set('font-size', App.settings.fontSize);
        const cssStyles = {
            'text-align': text.align,
            'text-baseline': text.baseline,
        };
        element.set('style', Object.entries(cssStyles)
            .filter(([_, v]) => typeof v !== 'undefined')
            .map(([k, v]) => `${k}: ${v};`).join(' '));
        this.render(element);
    }
    fmtp(point) {
        const p = point.get('screen').trunc();
        return `${p.x} ${p.y}`;
    }
    fmtv(vector) {
        const v = vector.get('screen');
        return `${v.x} ${v.y}`;
    }
    fmtd(distance) {
        const s = distance.get('screen');
        return `${s}`;
    }
    fmta(angle) {
        const a = angle.get('screen');
        return `${a}`;
    }
    render(svg) {
        svg.clean();
        this.root.appendChild(svg);
    }
    element(tag) {
        const id = `${tag}:${this.tagCount.inc(tag)}`;
        this.freshIds.add(id);
        if (this.cache.has(id)) {
            const e = this.cache.get(id);
            e.recycle();
            return e;
        }
        const element = new SvgElementWrap(document.createElementNS(VectorCanvas.NS, tag));
        this.cache.set(id, element);
        return element;
    }
    handleResize() {
        const width = this.root.element.clientWidth;
        const height = this.root.element.clientHeight;
        this.root.set('viewBox', [0, 0, width, height]);
        this.root.set('width', width);
        this.root.set('height', height);
    }
}
VectorCanvas.NS = 'http://www.w3.org/2000/svg';
VectorCanvas.defaultPathStyle = {
    fill: 'transparent',
    stroke: 'transparent',
};
class SvgElementWrap {
    constructor(element) {
        this.element = element;
        this.attributes = new Map();
        this.dirty = new Set();
    }
    get innerHTML() {
        return this.attributes.get('') || '';
    }
    set innerHTML(v) {
        this.attributes.set('', v);
    }
    recycle() {
        this.dirty.clear();
        for (const key of this.attributes.keys()) {
            this.dirty.add(key);
        }
        if (this.element.innerHTML.length > 0) {
            this.element.innerHTML = '';
        }
    }
    clean() {
        for (const key of this.dirty) {
            this.clear(key);
        }
    }
    setAll(attrs) {
        Object.keys(attrs).forEach(a => this.set(a, attrs[a]));
    }
    set(name, value) {
        if (typeof value === 'undefined') {
            this.clear(name);
            return;
        }
        this.dirty.delete(name);
        const v = this.format(value);
        if (this.attributes.get(name) === v) {
            return;
        }
        this.attributes.set(name, v);
        if (name === '') {
            // inner html marker
            this.element.innerHTML = v;
        }
        else {
            this.element.setAttribute(name, v);
        }
    }
    setXY(pos) {
        const p = pos.get('screen').trunc();
        this.set('x', p.x);
        this.set('y', p.y);
    }
    clear(name) {
        this.dirty.delete(name);
        if (this.attributes.has(name) && this.attributes.get(name).length > 0) {
            this.attributes.delete(name);
            if (name === '') {
                this.element.innerHTML = '';
            }
            else {
                this.element.removeAttribute(name);
            }
        }
    }
    format(value) {
        if (typeof value === 'string' || typeof value === 'number') {
            return value.toString();
        }
        return value.map(v => v.toString()).join(' ');
    }
    appendChild(svg) {
        this.element.appendChild(svg.element);
    }
}
"use strict";
var _a;
class Viewport {
    constructor(origin = Point.ZERO, radius = Viewport.DEFAULT_RADIUS, screen_width = 1000, screen_height = 1000) {
        this.origin = origin;
        this.radius = radius;
        this.screen_width = screen_width;
        this.screen_height = screen_height;
        this._changed = Refs.of(true);
        this.changedRef = Refs.ro(this._changed);
    }
    onChange(callback) {
        this._changed.onChange(c => {
            if (c)
                callback();
        });
    }
    getModelFrame() {
        return new Frame(this.origin, new Vec(this.radius, 0), new Vec(0, this.radius));
    }
    getScreenFrame() {
        const screen_size = Math.min(this.screen_width, this.screen_height);
        return new Frame(new Point(this.screen_width / 2., this.screen_height / 2), new Vec(screen_size / 2., 0), new Vec(0, -screen_size / 2));
    }
    get project() {
        const model = this.getModelFrame().unproject;
        const screen = this.getScreenFrame().project;
        return {
            point: p => screen.point(model.point(p)),
            vec: v => screen.vec(model.vec(v)),
            distance: d => screen.distance(model.distance(d)),
        };
    }
    get unproject() {
        const model = this.getModelFrame().project;
        const screen = this.getScreenFrame().unproject;
        return {
            point: p => model.point(screen.point(p)),
            vec: v => model.vec(screen.vec(v)),
            distance: d => model.distance(screen.distance(d)),
        };
    }
    get changed() {
        return this._changed.get();
    }
    resetChanged() {
        this._changed.set(false);
    }
    zoomIn() {
        this.radius = Math.max(10, this.radius / 1.1);
        this.updateTransforms();
    }
    zoomOut() {
        this.radius = this.radius * 1.1;
        this.updateTransforms();
    }
    setup() {
        this.handleResize();
        // sometimes the browser hasn't quite finished rendering things at the
        // point setup() is called.
        setTimeout(() => this.handleResize(), 100);
        window.addEventListener('resize', () => this.handleResize());
        App.pane.addEventListener('wheel', event => {
            const wheel = event;
            this.radius = Math.max(10, this.radius + Math.sign(wheel.deltaY) * 10);
            this.updateTransforms();
        });
        const markDirty = (_) => { this._changed.set(true); };
        App.settings.fontSizeRef.onChange(markDirty);
        App.settings.showGrid.onChange(markDirty);
        App.project.gridSpacingRef.onChange(markDirty);
        App.project.displayUnitRef.onChange(markDirty);
    }
    updateTransforms() {
        Spaces.put({
            name: 'model',
            project: this.getModelFrame().project,
            unproject: this.getModelFrame().unproject,
        });
        Spaces.put({
            name: 'screen',
            project: this.getScreenFrame().project,
            unproject: this.getScreenFrame().unproject,
        });
        this._changed.set(true);
    }
    recenter() {
        const handles = App.ecs.getComponents(Handle);
        const positions = Drags.closure('complete', ...handles.map(handle => handle.getDragItem())).points.map(point => point.get());
        const screen = {
            width: this.screen_width,
            height: this.screen_height,
            aspect: 1,
        };
        screen.aspect = screen.width / screen.height;
        if (positions.length === 0 || screen.width <= 0 || screen.height <= 0) {
            this.origin = Point.ZERO;
            this.radius = Viewport.DEFAULT_RADIUS;
            this.updateTransforms();
            return;
        }
        const bounds = {
            minX: Number.POSITIVE_INFINITY,
            minY: Number.POSITIVE_INFINITY,
            maxX: Number.NEGATIVE_INFINITY,
            maxY: Number.NEGATIVE_INFINITY,
        };
        const points = positions.map(p => p.get('model'));
        for (const point of points) {
            bounds.minX = Math.min(point.x, bounds.minX);
            bounds.minY = Math.min(point.y, bounds.minY);
            bounds.maxX = Math.max(point.x, bounds.maxX);
            bounds.maxY = Math.max(point.y, bounds.maxY);
        }
        const center = new Point((bounds.minX + bounds.maxX) / 2.0, (bounds.minY + bounds.maxY) / 2.0);
        const extents = {
            horizontal: (bounds.maxX - bounds.minX) / 2.0,
            vertical: (bounds.maxY - bounds.minY) / 2.0,
        };
        this.origin = center;
        this.radius = Math.max(extents.horizontal / screen.aspect, extents.vertical * screen.aspect) * 1.1;
        this.updateTransforms();
    }
    handleResize() {
        this.screen_width = Math.round(App.pane.clientWidth);
        this.screen_height = Math.round(App.pane.clientHeight);
        App.background.updateCanvasSize();
        App.canvas.updateCanvasSize();
        this.updateTransforms();
    }
}
Viewport.DEFAULT_RADIUS = 100;
class Canvas2d {
    constructor(el, autoclear) {
        this.el = el;
        this.autoclear = autoclear;
        this.transforms = [];
        this.g = el.getContext('2d');
    }
    setup() {
        App.settings.fontSizeRef.onChange(f => this.fontSize = f);
    }
    update() {
        if (this.autoclear) {
            this.clear();
        }
    }
    updateCanvasSize() {
        this.el.width = this.el.clientWidth;
        this.el.height = this.el.clientHeight;
        this.fontSize = App.settings.fontSize;
    }
    get width() {
        return Math.floor(this.el.clientWidth);
    }
    get height() {
        return Math.floor(this.el.clientHeight);
    }
    pushTransform() {
        this.transforms.push(this.g.getTransform());
    }
    popTransform() {
        const transform = this.transforms.pop();
        if (transform) {
            this.g.setTransform(transform);
        }
    }
    translate(offset) {
        const off = offset.get('screen');
        this.g.translate(off.x, off.y);
    }
    translateTo(position) {
        this.translate(position.to('screen').toVector());
    }
    rotate(angle) {
        const radians = angle.get('screen');
        this.g.rotate(unwrap(radians));
    }
    clear() {
        this.g.clearRect(0, 0, this.width + 1, this.height + 1);
    }
    set strokeStyle(style) {
        this.g.strokeStyle = style;
    }
    set fillStyle(style) {
        this.g.fillStyle = style;
    }
    setLineDash(segments) {
        this.g.setLineDash(segments);
    }
    set fontSize(s) {
        this.g.font = `${s}px sans-serif`;
    }
    set lineWidth(w) {
        this.g.lineWidth = w;
    }
    set textAlign(a) {
        this.g.textAlign = a;
    }
    set textBaseline(a) {
        this.g.textBaseline = a;
    }
    fill() {
        this.g.fill();
    }
    stroke() {
        this.g.stroke();
    }
    beginPath() {
        this.g.beginPath();
    }
    closePath() {
        this.g.closePath();
    }
    moveTo(pos) {
        const p = pos.get('screen');
        this.g.moveTo(p.x, p.y);
    }
    lineTo(pos) {
        const p = pos.get('screen');
        this.g.lineTo(p.x, p.y);
    }
    bezierCurveTo(two, three, four) {
        const [b, c, d] = [two, three, four].map(p => p.get('screen'));
        this.g.bezierCurveTo(b.x, b.y, c.x, c.y, d.x, d.y);
    }
    arrow(src, dst, width = Distance(1, 'screen')) {
        this.polygon(Polygon.arrow(src, dst, width));
    }
    polygon(polygon) {
        this.beginPath();
        polygon.vertices.forEach((v, i) => {
            if (i === 0) {
                this.moveTo(v);
            }
            else {
                this.lineTo(v);
            }
        });
        this.closePath();
    }
    arc(center, radius, startAngle, endAngle, counterClockwise) {
        const c = center.get('screen');
        this.g.arc(c.x, c.y, radius.get('screen'), unwrap(startAngle.get('screen')), unwrap(endAngle.get('screen')), counterClockwise);
    }
    strokeLine(src, dst) {
        this.beginPath();
        this.moveTo(src);
        this.lineTo(dst);
        this.stroke();
    }
    image(image, pos, width, height) {
        const p = pos.get('screen');
        this.g.drawImage(image, p.x, p.y, (width === null || width === void 0 ? void 0 : width.get('screen')) || image.width, (height === null || height === void 0 ? void 0 : height.get('screen')) || image.height);
    }
    strokeCircle(src, radius) {
        const g = this.g;
        const c = src.get('screen');
        g.beginPath();
        g.arc(c.x, c.y, radius.get('screen'), 0, 2 * Math.PI);
        g.stroke();
    }
    fillCircle(src, radius) {
        const g = this.g;
        const c = src.get('screen');
        g.beginPath();
        g.arc(c.x, c.y, radius.get('screen'), 0, 2 * Math.PI);
        g.fill();
    }
    rect(rect) {
        this.beginPath();
        const [first, ...more] = rect.corners;
        this.moveTo(first);
        for (const m of more) {
            this.lineTo(m);
        }
        this.closePath();
    }
    text(props) {
        const p = props.point.get('screen');
        const fillStyle = props.fill || this.g.fillStyle;
        const axisAngle = typeof props.axis === 'undefined'
            ? Radians(0)
            : props.axis.get('screen').angle();
        const angle = props.keepUpright ? uprightAngle(axisAngle) : axisAngle;
        this.g.translate(p.x, p.y);
        this.g.rotate(unwrap(angle));
        if (typeof props.align !== 'undefined') {
            this.g.textAlign = props.align;
        }
        if (typeof props.baseline !== 'undefined') {
            this.g.textBaseline = props.baseline;
        }
        if (typeof props.shadow !== 'undefined') {
            this.g.fillStyle = props.shadow;
            this.g.fillText(props.text, 1, 1);
        }
        this.g.fillStyle = fillStyle;
        this.g.fillText(props.text, 0, 0);
        if (typeof props.stroke !== 'undefined') {
            this.g.lineWidth = props.lineWidth || this.g.lineWidth;
            this.g.strokeStyle = props.stroke;
            this.g.strokeText(props.text, 0, 0);
        }
        this.g.rotate(-unwrap(angle));
        this.g.translate(-p.x, -p.y);
    }
    createLinearGradient(src, dst) {
        const a = src.get('screen');
        const b = dst.get('screen');
        return this.g.createLinearGradient(a.x, a.y, b.x, b.y);
    }
}
class Arrow extends Component {
    constructor(entity, src, dst, color, label = '') {
        super(entity);
        this.color = color;
        this.label = label;
        this.src = Refs.of(src);
        this.dst = Refs.of(dst);
        entity.add(Handle, {
            getPos: () => this.src.get(),
            distance: p => new SpaceEdge(this.src.get(), this.dst.get()).distance(p),
        });
    }
    get vector() {
        return Vectors.between(this.src.get(), this.dst.get());
    }
}
const MarkupRenderer = (ecs) => {
    for (const arrow of ecs.getComponents(Arrow)) {
        App.canvas.arrow(arrow.src.get(), arrow.dst.get());
        App.canvas.fillStyle = arrow.color;
        App.canvas.lineWidth = 1;
        App.canvas.fill();
        if (arrow.label) {
            App.canvas.text({
                text: arrow.label,
                fill: arrow.color,
                point: arrow.src.get().splus(0.5, arrow.vector).splus(Distance(App.settings.fontSize, 'screen'), arrow.vector.unit()),
                align: 'center',
                baseline: 'bottom',
                axis: arrow.vector,
                keepUpright: true,
            });
        }
    }
};
class Grid extends Component {
    constructor(entity) {
        super(entity);
        this[_a] = true;
        this.origin = Position(Point.ZERO, 'model');
        this._dirty = true;
        this._spacing = Distance(1, 'model');
        this._horizontal = Vector(Axis.X, 'model');
        this._vertical = Vector(Axis.Y, 'model');
        this._displayDecimals = 0;
        App.project.gridSpacingRef.onChange(gs => this.markDirty());
        App.project.displayUnitRef.onChange(gs => this.markDirty());
        App.project.modelUnitRef.onChange(gs => this.markDirty());
    }
    get spacing() { return this._spacing; }
    get horizontalSpan() { return this._horizontal; }
    get verticalSpan() { return this._vertical; }
    get displayDecimals() { return this._displayDecimals; }
    get dirty() {
        return this._dirty;
    }
    markDirty() {
        this._dirty = true;
    }
    update() {
        this._dirty = false;
        this._spacing = Distance(App.project.modelUnit.from(App.project.gridSpacing).value, 'model');
        this._horizontal = Vector(Axis.X, 'screen').to('model').unit().scale(this.spacing);
        this._vertical = Vector(Axis.Y, 'screen').to('model').unit().scale(this.spacing);
        this._displayDecimals = this.calcDisplayDecimals();
    }
    snap(position) {
        const point = position.get('model');
        const spacing = this.spacing.get('model');
        return Position(new Point(Math.round(point.x / spacing) * spacing, Math.round(point.y / spacing) * spacing), 'model');
    }
    snapDelta(position) {
        return Vectors.between(position, this.snap(position));
    }
    snapHorizontal(position) {
        const delta = this.snapDelta(position);
        return position.plus(delta.onAxis(this._horizontal));
    }
    snapVertical(position) {
        const delta = this.snapDelta(position);
        return position.plus(delta.onAxis(this._vertical));
    }
    getClosestRow(position) {
        const delta = Vectors.between(this.origin, position.to('model'));
        return Math.round(delta.dot(this._vertical.unit()).div(this.spacing));
    }
    getClosestColumn(position) {
        const delta = Vectors.between(this.origin, position.to('model'));
        return Math.round(delta.dot(this._horizontal.unit()).div(this.spacing));
    }
    getPointAt(row, col) {
        return this.origin
            .splus(row, this._vertical)
            .splus(col, this._horizontal);
    }
    formatLabel(index, decimals) {
        const { value, unit } = App.project.gridSpacing;
        return App.project.displayUnit.format({ value: value * index, unit }, typeof decimals !== 'undefined' ? decimals : this.displayDecimals);
    }
    toJson() {
        return {
            factory: this.constructor.name,
            arguments: [],
        };
    }
    calcDisplayDecimals() {
        const du = App.project.displayUnit;
        const spacing = App.project.gridSpacing;
        const enough = (decimals) => {
            const multiples = [0, 1, 2, 3];
            const labels = new Set(multiples.map(m => this.formatLabel(m, decimals)));
            return labels.size === multiples.length;
        };
        let decimals = 0;
        while (!enough(decimals) && decimals < 6) {
            decimals++;
        }
        return decimals;
    }
    static getGrid() {
        const grids = App.ecs.getComponents(Grid);
        if (grids.length === 0) {
            return App.ecs.createEntity().add(Grid);
        }
        const [first, ...more] = grids;
        more.forEach(grid => grid.entity.destroy());
        return grids[0];
    }
}
_a = SOLO;
ComponentFactories.register(Grid, (entity) => {
    return entity.add(Grid);
});
const GridRenderer = (ecs) => {
    const grid = Grid.getGrid();
    if (!App.viewport.changed && !grid.dirty)
        return;
    App.viewport.resetChanged();
    grid.update();
    const c = App.background;
    c.clear();
    if (!App.settings.showGrid.get())
        return;
    const columns = Math.ceil(Distance(App.viewport.screen_width, 'screen').div(grid.spacing)) + 2;
    const rows = Math.ceil(Distance(App.viewport.screen_height, 'screen').div(grid.spacing)) + 1;
    const screenOrigin = Position(Point.ZERO, 'screen'); // top-left corner
    const startRow = grid.getClosestRow(screenOrigin) - 1;
    const startCol = grid.getClosestColumn(screenOrigin) - 1;
    const endRow = startRow + rows;
    const endCol = startCol + columns;
    c.lineWidth = 1;
    c.setLineDash([]);
    c.strokeStyle = '#cccccc';
    const textMargin = Distance(10, 'screen');
    for (let i = 0; i < rows; i++) {
        c.strokeLine(grid.getPointAt(startRow + i, startCol), grid.getPointAt(startRow + i, endCol));
    }
    for (let i = 0; i < columns; i++) {
        c.strokeLine(grid.getPointAt(startRow, startCol + i), grid.getPointAt(endRow, startCol + i));
    }
    const rowLabelOrigin = screenOrigin.splus(textMargin, Vector(Axis.X, 'screen'));
    for (let i = 1; i < rows; i++) {
        const row = startRow + i;
        c.text({
            text: grid.formatLabel(row),
            point: grid.snapVertical(rowLabelOrigin.splus(i, grid.verticalSpan)),
            align: 'left',
            baseline: 'middle',
            fill: 'black',
        });
    }
    const columnLabelOrigin = screenOrigin.splus(textMargin, Vector(Axis.Y, 'screen'));
    for (let i = 1; i < columns; i++) {
        const col = startCol + i;
        c.text({
            text: grid.formatLabel(col),
            point: grid.snapHorizontal(columnLabelOrigin.splus(i, grid.horizontalSpan)),
            align: 'center',
            baseline: 'top',
            fill: 'black',
        });
    }
};
"use strict";
class Tool {
    constructor(name) {
        this.name = name;
        this.events = new UiEventDispatcher(this.constructor);
    }
    get allowSnap() {
        return false;
    }
    get description() {
        return '';
    }
    get icon() {
        return null;
    }
    get cursor() {
        return 'default';
    }
    createUi(form) {
    }
    onToolSelected() {
    }
    onToolDeselected() {
    }
}
class NoopTool extends Tool {
    constructor() {
        super('none');
    }
    setup() { }
    update() { }
}
class ToolChain {
    constructor() {
        this.groups = [];
        this.groupMap = new Map();
    }
    getGroup(name) {
        return this.groupMap.get(name);
    }
    addSingle(tool) {
        return this.addGroup(tool, [tool]);
    }
    addGroup(name, tools, icon) {
        if (this.groupMap.has(name)) {
            throw new Error(`Cannot overwrite tool group ${name}.`);
        }
        if (tools.length === 0) {
            throw new Error(`Cannot create empty tool group ${name}.`);
        }
        const group = { name, tools, icon, current: tools[0] };
        this.groups.push(group);
        this.groupMap.set(name, group);
        return this;
    }
}
class Tools {
    constructor() {
        this.registry = new Map();
        this.toolListeners = new Array();
        this.stack = new Array();
        this._current = Refs.of(new NoopTool(), (a, b) => a.name === b.name);
        this.chain = new ToolChain()
            .addSingle('pointer tool')
            .addSingle('pan tool')
            .addSingle('room tool')
            .addSingle('ruler tool')
            .addSingle('joint tool')
            .addSingle('furniture tool')
            .addSingle('images tool');
    }
    get current() {
        return this._current.get();
    }
    get currentRef() {
        return this._current;
    }
    pushTool() {
        this.stack.push(this.current.name);
    }
    popTool() {
        const tool = this.stack.pop();
        if (typeof tool !== 'undefined') {
            this.set(tool);
            return tool;
        }
        return null;
    }
    register(kind) {
        const tool = new kind();
        if (this.registry.has(tool.name)) {
            const existing = this.registry.get(tool.name);
            throw new Error(`Cannot register ${tool.name} to ${kind.name}, because it would overwrwite ${existing.constructor.name}.`);
        }
        this.registry.set(tool.name, tool);
        // register action to switch to this tool (can be used by hotkeys)
        App.actions.register({ name: tool.name, apply: () => this.set(tool.name) });
        App.log('registered tool', tool.name, tool);
    }
    getTools() {
        return Array.from(this.registry.values());
    }
    getTool(name) {
        return this.registry.get(name);
    }
    set(name) {
        if (this.current.name === name) {
            return;
        }
        const previous = this.current;
        const tool = this.registry.get(name);
        this.toolListeners.forEach(listener => listener(name));
        this._current.set(tool);
        App.pane.style.cursor = tool.cursor;
        App.gui.tool.clear();
        App.ui.clearSelection();
        App.ui.cancelDrag();
        const ui = new AutoForm();
        tool.createUi(ui);
        ui.inflate(App.gui.tool);
        previous.onToolDeselected();
        tool.onToolSelected();
    }
    update() {
        this.current.update();
    }
    allToolsRegistered() {
        return this.chain.groups.every(group => group.tools.every(tool => this.registry.has(tool)));
    }
    setup() {
        for (const tool of this.registry.values()) {
            tool.setup();
        }
        const toolbar = document.getElementsByClassName('toolbar')[0];
        this.chain.groups.forEach(group => this.setupToolGroup(toolbar, group));
        this.set('pointer tool');
    }
    setupToolGroup(toolbar, group) {
        const tools = group.tools.map(name => this.registry.get(name));
        const icon = group.icon || (tools.length === 1 ? tools[0].icon : undefined);
        const button = new IconButton(group.name, icon);
        toolbar.appendChild(button.element);
        button.onClick(() => this.set(group.current));
        this.toolListeners.push(tool => {
            button.selected = new Set(group.tools).has(tool);
        });
        if (tools.length === 1) {
            button.tooltip = this.getTooltip(group.tools[0]);
            return; // don't need to add group options.
        }
    }
    createToolButton(tool) {
        const button = new IconButton(tool.name, tool.icon);
        return button.element;
    }
    getTooltip(tool) {
        const parts = [tool];
        const keybinds = App.keybindings.values()
            .filter(kb => kb.action === tool)
            .map(kb => formatKeyStroke(kb.stroke))
            .join(' or ');
        if (keybinds.length > 0) {
            parts.push(`(${keybinds})`);
        }
        const description = this.registry.get(tool).description;
        if (description.length > 0) {
            parts.push(`— ${description}`);
        }
        return parts.join(' ');
    }
}
"use strict";
class UserActions {
    constructor() {
        this.map = new Map();
    }
    setup() {
        const add = (name, apply) => this.register({
            name, apply
        });
        const toggle = (name, ref) => add(name, () => ref.set(!ref.get()));
        toggle('toggle-snap', App.ui.snapping.enableByDefaultRef);
        toggle('toggle-kinematics', App.settings.kinematics);
        add('toggle-debug', () => {
            App.debug = !App.debug;
        });
        add('loop-select', () => App.ui.loopSelect());
        add('select-all', () => App.ui.selectAll());
        add('recenter', () => App.viewport.recenter());
        add('zoom-in', () => App.viewport.zoomIn());
        add('zoom-out', () => App.viewport.zoomOut());
        add('undo', () => App.history.undo());
        add('redo', () => App.history.redo());
        add('flip-h', () => App.ui.flip('horizontal'));
        add('flip-v', () => App.ui.flip('vertical'));
        add('new', () => App.project.newProject());
        add('open', () => App.project.openProject());
        add('save', () => App.project.saveProject());
        add('export-png', () => App.imageExporter.export());
        // add('foo', () => doFoo());
    }
    register(action) {
        if (this.map.has(action.name)) {
            throw new Error(`Already bound action ${action}.`);
        }
        this.map.set(action.name, action);
    }
    get(action) {
        return this.map.get(action);
    }
    get actions() {
        return Array.from(this.map.keys());
    }
    fire(action) {
        this.get(action).apply();
    }
    evaluateKeybindings() {
        const stroke = {
            keys: App.ui.pressedKeys,
        };
        const hotkey = App.keybindings.match(stroke);
        if (hotkey !== null) {
            const action = this.get(hotkey.action);
            App.log('executing keybinding', formatKeyStroke(hotkey.stroke), ':', action.name);
            action.apply();
            return true;
        }
        return false;
    }
}
"use strict";
const formatKeyStroke = (stroke) => {
    return stroke.keys.sort((a, b) => b.length - a.length)
        .map(k => k === ' ' ? '⎵' : k)
        .join(' + ');
};
const formatKeyBinding = (keybinding) => {
    return `${formatKeyStroke(keybinding.stroke)}: ${keybinding.action}`;
};
class Keybindings {
    constructor() {
        this.bindings = new Array();
    }
    static defaults() {
        const kb = new Keybindings();
        // bind common "default tool" hotkeys from various
        // other cad and graphical apps
        kb.bind('s').to('pointer tool'); // matches inkscape hotkey
        kb.bind(' ').to('pointer tool'); // matches sketchup hotkey
        kb.bind('Escape').to('pointer tool'); // nearly universal convention
        kb.bind('h').to('pan tool'); // matches sketchup hotkey
        kb.bind('r').to('room tool');
        kb.bind('t').to('ruler tool'); // 't' as in tape measure, matches sketchup
        kb.bind('j').to('joint tool');
        kb.bind('n').to('joint tool'); // matches inkscape hotkey
        kb.bind('d').to('furniture tool');
        kb.bind('f').to('flip-h');
        kb.bind('Shift', 'F').to('flip-v');
        kb.bind('Shift', '%').to('toggle-snap');
        kb.bind('k').to('toggle-kinematics');
        kb.bind('Control', 'l').to('loop-select'); // matches blender
        kb.bind('Control', 'a').to('select-all'); // nearly universal convention lol
        kb.bind('0').to('recenter'); // common convention
        kb.bind('Control', 'z').to('undo'); // universal 
        kb.bind('Control', 'Shift', 'Z').to('redo'); // common convention
        kb.bind('Shift', 'D').to('export-png'); // google drive?
        kb.bind('Shift', '?').to('toggle-debug');
        // lots of permutations for zooming so that it works
        // regardless (and so that we prevent the browser's
        // native zoom from making everything wonky).
        kb.bind('+').to('zoom-in');
        kb.bind('=').to('zoom-in');
        kb.bind('Control', '+').to('zoom-in');
        kb.bind('Control', 'Shift', '+').to('zoom-in');
        kb.bind('Control', '=').to('zoom-in');
        kb.bind('Shift', '+').to('zoom-in');
        kb.bind('-').to('zoom-out');
        kb.bind('Control', '-').to('zoom-out');
        kb.bind('Control', '_').to('zoom-out');
        kb.bind('Control', 's').to('save'); // universal
        kb.bind('Control', 'n').to('new'); // universal
        kb.bind('Control', 'o').to('open'); // universal
        return kb;
    }
    values() {
        return this.bindings.map(x => x);
    }
    bind(...keys) {
        return {
            to: (action) => {
                this.add({
                    action,
                    stroke: { keys },
                });
            },
        };
    }
    add(binding) {
        this.bindings.push(binding);
    }
    match(stroke) {
        if (stroke.keys.length === 0)
            return null;
        const keys = new Set(stroke.keys);
        const bindings = this.values()
            .sort((a, b) => b.stroke.keys.length - a.stroke.keys.length);
        for (const binding of bindings) {
            if (this.matches(stroke, binding)) {
                return binding;
            }
        }
        return null;
    }
    matches(stroke, binding) {
        const strokeKeys = new Set(stroke.keys);
        const bindingKeys = new Set(binding.stroke.keys);
        return stroke.keys.every(k => bindingKeys.has(k))
            && binding.stroke.keys.every(k => strokeKeys.has(k));
    }
}
"use strict";
const Drags = {
    empty: () => ({ kind: 'empty', name: '', }),
    closure: (type, ...roots) => {
        var _a;
        const closure = {
            points: [],
            snaps: [],
        };
        const seenItems = new Set();
        const seenSnaps = new Set();
        const frontier = [...roots];
        while (frontier.length > 0) {
            const item = frontier.pop();
            if (seenItems.has(item))
                continue;
            seenItems.add(item);
            if (roots.length > 1 && item.disableWhenMultiple) {
                continue;
            }
            (_a = item.snaps) === null || _a === void 0 ? void 0 : _a.forEach(s => {
                if (seenSnaps.has(s))
                    return;
                seenSnaps.add(s);
                closure.snaps.push(s);
            });
            if (item.kind === 'empty') {
                continue;
            }
            if (item.kind === 'point') {
                closure.points.push(item);
                continue;
            }
            if (item.kind === 'group') {
                for (const x of item.items) {
                    if (roots.length > 1 && x.disableWhenMultiple) {
                        continue;
                    }
                    frontier.push(x);
                    if (type === 'minimal' && item.aggregate !== 'all') {
                        break;
                    }
                }
            }
        }
        return closure;
    },
    chooseSnap: (context, filter = ((_) => true)) => {
        const { drag, starts, closure } = context;
        const validCategories = new Set();
        const allCategories = [
            'local', 'geometry', 'guide', 'global', 'grid',
        ];
        for (const point of closure.points) {
            if (typeof point.snapCategories === 'undefined') {
                allCategories.forEach(c => validCategories.add(c));
                break;
            }
            point.snapCategories.forEach(c => validCategories.add(c));
            if (validCategories.size === allCategories.length) {
                break;
            }
        }
        let best = null;
        let index = 0;
        for (const point of closure.points) {
            const pointDrag = new Drag(starts[index], starts[index].plus(drag.delta));
            for (const snap of closure.snaps) {
                if (!filter(snap))
                    continue;
                if (!validCategories.has(snap.category))
                    continue;
                if (typeof snap.closeEnough !== 'undefined' && !snap.closeEnough(pointDrag)) {
                    continue;
                }
                const snapped = pointDrag.snapped(snap);
                const distance = Distances.between(pointDrag.end, snapped.end);
                if (best === null || distance.lt(best.distance)) {
                    best = {
                        snap,
                        item: closure.points[index],
                        distance,
                        snapped,
                        original: pointDrag,
                    };
                }
            }
            index++;
        }
        return best;
    },
};
class Drag {
    constructor(start, end) {
        this.start = start;
        this.end = end;
        this.edge = new SpaceEdge(start, end);
    }
    get midpoint() {
        return this.edge.midpoint;
    }
    get tangent() {
        return this.edge.tangent;
    }
    get normal() {
        return this.edge.normal;
    }
    get delta() {
        return this.edge.vector;
    }
    onAxis(direction) {
        return new Drag(this.start, this.start.plus(this.delta.onAxis(direction)));
    }
    onLine(origin, direction) {
        return new Drag(this.start, this.end.onLine(origin, direction));
    }
    snapped(snap) {
        if (snap.kind === 'point') {
            return new Drag(this.start, snap.func(this.end));
        }
        if (snap.kind === 'vector') {
            return new Drag(this.start, this.start.plus(snap.func(this.delta)));
        }
        if (snap.kind === 'func') {
            return new Drag(this.start, snap.func(this));
        }
        if (snap.kind === 'axis') {
            if (typeof snap.origin === 'undefined') {
                return this.onAxis(snap.direction);
            }
            return this.onLine(snap.origin, snap.direction);
        }
        return impossible(snap);
    }
    applyTo(item) {
        if (item.kind === 'empty')
            return;
        if (item.kind === 'group') {
            item.items.forEach(item => this.applyTo(item));
            return;
        }
        if (item.kind === 'point') {
            item.set(this.end);
            return;
        }
        return impossible(item);
    }
}
"use strict";
const getResizeCursor = (direction, bidirectional = true) => {
    const dir = direction.get('screen');
    const options = [
        [new Vec(0, -1), 'n-resize', 'ns-resize'],
        [new Vec(+1, -1), 'ne-resize', 'nesw-resize'],
        [new Vec(+1, 0), 'e-resize', 'ew-resize'],
        [new Vec(+1, +1), 'se-resize', 'nwse-resize'],
        [new Vec(0, +1), 's-resize', 'ns-resize'],
        [new Vec(-1, +1), 'sw-resize', 'nesw-resize'],
        [new Vec(-1, 0), 'w-resize', 'ew-resize'],
        [new Vec(-1, -1), 'nw-resize', 'nwse-resize'],
    ];
    const map = new Map();
    for (const [vec, uni, bi] of options) {
        map.set(bidirectional ? bi : uni, vec.unit());
    }
    const compare = (a, b) => {
        const d = a.dot(b);
        return bidirectional ? Math.abs(d) : d;
    };
    const choices = Array.from(map.keys());
    return choices.reduce((a, b) => compare(dir, map.get(a)) >= compare(dir, map.get(b)) ? a : b, choices[0]);
};
"use strict";
var _a, _b, _c, _d, _e;
class Surfaced extends Component {
    constructor(entity, getSurface) {
        super(entity);
        this.getSurface = getSurface;
        this[_a] = true;
    }
    intersects(sdf) {
        return this.getSurface().map(s => s.intersects(sdf)).or(false);
    }
    containedBy(sdf) {
        return this.getSurface().map(s => s.containedBy(sdf)).or(false);
    }
}
_a = SOLO;
class Lever extends Component {
    constructor(entity, parent, origin, position, cursor, enabled = Refs.ofRo(true)) {
        super(entity);
        this.parent = parent;
        this.origin = origin;
        this.position = position;
        this.enabled = enabled;
        this.handle = entity.ecs.createEntity().add(Handle, {
            draggable: true,
            clickable: false,
            selectable: false,
            hoverable: false,
            control: true,
            visible: () => this.visible,
            getPos: () => position.get(),
            distance: p => new Circle(position.get(), Distance(5, 'screen')).sdist(p),
            cursor: typeof cursor === 'undefined' ? undefined : (() => cursor),
            priority: parent.priority + 0.5,
            tools: Array.from(parent.tools),
            drag: () => ({
                name: 'handle',
                kind: 'point',
                get: () => position.get(),
                set: p => position.set(p),
                disableWhenMultiple: true,
            }),
        });
        this.tangentRef = Refs.memoReduce((a, b, _) => Vectors.between(a.to('screen'), b.to('screen')).unit(), origin, position, App.viewport.changedRef);
    }
    get tangent() {
        return this.tangentRef.get();
    }
    get visible() {
        return this.parent.isSelected && this.enabled.get();
    }
    tearDown() {
        this.handle.entity.destroy();
    }
}
class Dragging extends Component {
    constructor(entity) {
        super(entity);
        this[_b] = true;
    }
}
_b = SOLO;
class Hovered extends Component {
    constructor(entity) {
        super(entity);
        this[_c] = true;
    }
    unhover() {
        this.entity.removeAll(Hovered);
    }
}
_c = SOLO;
class Selected extends Component {
    constructor(entity) {
        super(entity);
        this[_d] = true;
        this.selectionIndex = App.ecs.getComponents(Selected).length;
    }
    deselect() {
        this.entity.removeAll(Selected);
    }
}
_d = SOLO;
class Handle extends Component {
    constructor(entity, props) {
        super(entity);
        this.props = props;
        this[_e] = true;
        this.events = new UiEventDispatcher(Handle);
        this.knobs = [];
        this.clickable = true;
        this.draggable = true;
        this.hoverable = true;
        this.selectable = true;
        this.ignoreNonPrimary = true;
        this.priority = 0;
        this.control = false;
        this.priority = typeof props.priority === 'undefined' ? 0 : props.priority;
        this.clickable = typeof props.clickable === 'undefined' ? true : props.clickable;
        this.draggable = typeof props.draggable === 'undefined' ? true : props.draggable;
        this.hoverable = typeof props.hoverable === 'undefined' ? true : props.hoverable;
        this.selectable = typeof props.selectable === 'undefined' ? true : props.selectable;
        this._cursor = typeof props.cursor === 'undefined' ? () => null : props.cursor;
        this._visible = typeof props.visible === 'undefined' ? (() => true) : props.visible;
        this._drag = typeof props.drag === 'undefined' ? Drags.empty : props.drag;
        this._tools = new Set(props.tools || []);
        this.control = !!props.control;
        this.getPos = props.getPos;
        this._onDelete = props.onDelete;
        this._knob = props.knob;
        const defaultDistanceFunc = (p) => Distances.between(props.getPos(), p);
        this.distanceFunc = typeof props.distance === 'undefined'
            ? defaultDistanceFunc : props.distance;
    }
    isSpecificallyFor(name) {
        return this._tools.has(name);
    }
    isForTool(name) {
        return this._tools.size === 0 || this._tools.has(name);
    }
    get tools() {
        return Array.from(this._tools);
    }
    selectWithAppropriateTool() {
        const tools = this.tools;
        if (tools.length === 0) {
            App.tools.set('pointer tool');
            return;
        }
        for (const tool of tools) {
            App.tools.set(tool);
            App.ui.clearSelection();
            App.ui.select(this);
            return;
        }
    }
    get knob() {
        const k = this._knob;
        if (typeof k === 'undefined') {
            return null;
        }
        return Object.assign({}, k);
    }
    createKnob(props, handleProps) {
        const knob = this.entity.ecs.createEntity().add(Handle, Object.assign(Object.assign({}, handleProps), { knob: Object.assign(Object.assign({}, props), { parent: this.entity }), distance: p => props.poly().sdist(p).max(Distance(0, 'model')), getPos: () => props.poly().centroid, control: true }));
        this.addKnob(knob);
        return knob;
    }
    addKnob(knob) {
        this.knobs.push(knob);
        this.tools.forEach(t => knob._tools.add(t));
    }
    getDragClosure(type) {
        return Drags.closure(type, this.getDragItem());
    }
    getDragItem() {
        return this._drag();
    }
    getContextualCursor() {
        // if already selected, prioritize showing the user that this can be dragged.
        // otherwise, prioritize highlighting that this can be clicked.
        if (this.clickable && !App.ui.dragging && !this.isSelected) {
            return 'pointer';
        }
        if (this.draggable) {
            const nonSpecific = App.ui.dragging ? 'grabbing' : 'grab';
            if (App.ui.selection.size > 1 || this.cursor === null) {
                return nonSpecific;
            }
            return this.cursor;
        }
        return this.clickable ? 'pointer' : 'default';
    }
    /** user initiated delete event. */
    delete() {
        if (this.entity.isDestroyed) {
            return false; // we're already dead ....
        }
        // tries to "nicely" delete this by asking permission first.
        if (typeof this._onDelete !== 'undefined') {
            if (this._onDelete() === 'keep') {
                return false;
            }
        }
        this.entity.destroy();
        return true;
    }
    intersects(sdf) {
        if (this.entity.has(Surfaced)) {
            return this.entity.only(Surfaced).intersects(sdf);
        }
        return sdf.contains(this.getPos());
    }
    containedBy(sdf) {
        if (this.entity.has(Surfaced)) {
            return this.entity.only(Surfaced).containedBy(sdf);
        }
        return sdf.contains(this.getPos());
    }
    get visible() {
        return this._visible();
    }
    get cursor() {
        return this._cursor();
    }
    get isHovered() {
        return this.entity.has(Hovered);
    }
    get isSelected() {
        return this.entity.has(Selected);
    }
    get isActive() {
        return this.isHovered || this.isSelected || this.dragging;
    }
    get dragging() {
        return this.entity.has(Dragging);
    }
    set dragging(d) {
        if (d)
            this.entity.getOrCreate(Dragging);
        else
            this.entity.removeAll(Dragging);
    }
    set hovered(h) {
        if (h) {
            this.entity.add(Hovered);
        }
        else {
            this.entity.removeAll(Hovered);
        }
    }
    set selected(s) {
        if (!s) {
            this.entity.removeAll(Selected);
            this.hovered = false;
        }
        else {
            this.entity.add(Selected);
        }
    }
    get pos() {
        return this.props.getPos();
    }
    distanceFrom(p) {
        return this.distanceFunc(p);
    }
    tearDown() {
        for (const knob of this.knobs) {
            knob.entity.destroy();
        }
    }
    toJson() {
        return {
            factory: this.constructor.name,
            arguments: [{
                    clickable: this.clickable,
                    draggable: this.draggable,
                    hoverable: this.hoverable,
                    selectable: this.selectable,
                    priority: this.priority,
                    tools: this.tools,
                }],
        };
    }
    static load(entity, props) {
        const handle = entity.maybe(Handle);
        if (!handle)
            return 'not ready';
        handle.clickable = props.clickable;
        handle.draggable = props.draggable;
        handle.hoverable = props.hoverable;
        handle.selectable = props.selectable;
        handle.priority = props.priority || 0;
        (props.tools || []).forEach(t => handle._tools.add(t));
        return handle;
    }
}
_e = SOLO;
ComponentFactories.register(Handle, Handle.load);
"use strict";
var _a;
/** resizeable and draggable rectangles */
class Rectangular extends Component {
    constructor(entity) {
        super(entity);
        this[_a] = true;
        this.centerRef = Refs.of(Positions.zero('model'), Rectangular.posEq);
        this.widthRef = Refs.of(Distances.zero('model'), Rectangular.distEq);
        this.heightRef = Refs.of(Distances.zero('model'), Rectangular.distEq);
        this.rotationRef = Refs.of(Angle(Radians(0), 'model'), Rectangular.angleEq);
        this.keepAspectRef = Refs.of(false);
        this.allowResizeH = Refs.of(true);
        this.allowResizeV = Refs.of(true);
        this.allowRotate = Refs.of(true);
        this.aspect = Refs.of(1);
        this.createdHandle = false;
        this.horizontal = Refs.memoReduce((width, angle, _) => Vector(Axis.X, 'screen').to('model').rotate(angle).unit().scale(width), this.widthRef, this.rotationRef, App.viewport.changedRef);
        this.vertical = Refs.memoReduce((height, angle, _) => Vector(Axis.Y, 'screen').to('model').rotate(angle).unit().scale(height), this.heightRef, this.rotationRef, App.viewport.changedRef);
        this.horizontalAxisRef = Refs.memo(this.horizontal, v => v.unit());
        this.verticalAxisRef = Refs.memo(this.vertical, v => v.unit());
        const spanCalc = (scale) => (extent) => extent.scale(scale);
        // directional extents from centroid
        this.upSpan = Refs.memoReduce(spanCalc(-0.5), this.vertical);
        this.downSpan = Refs.memoReduce(spanCalc(0.5), this.vertical);
        this.leftSpan = Refs.memoReduce(spanCalc(-0.5), this.horizontal);
        this.rightSpan = Refs.memoReduce(spanCalc(0.5), this.horizontal);
        const aplusb = (a, b) => a.plus(b);
        // edge midpoints
        this.topRef = Refs.memoReduce(aplusb, this.centerRef, this.upSpan);
        this.bottomRef = Refs.memoReduce(aplusb, this.centerRef, this.downSpan);
        this.leftRef = Refs.memoReduce(aplusb, this.centerRef, this.leftSpan);
        this.rightRef = Refs.memoReduce(aplusb, this.centerRef, this.rightSpan);
        // corners
        this.topLeftRef = Refs.memoReduce(aplusb, this.topRef, this.leftSpan);
        this.topRightRef = Refs.memoReduce(aplusb, this.topRef, this.rightSpan);
        this.bottomLeftRef = Refs.memoReduce(aplusb, this.bottomRef, this.leftSpan);
        this.bottomRightRef = Refs.memoReduce(aplusb, this.bottomRef, this.rightSpan);
        // dragging
        this.dragItem = Refs.memoReduce((..._) => this.computeDragItem(), this.centerRef, this.widthRef, this.heightRef);
        this.edgesRef = Refs.memoReduce((...points) => points.map((p, i) => new MemoEdge(p, points[(i + 1) % points.length])), this.topLeftRef, this.topRightRef, this.bottomRightRef, this.bottomLeftRef);
        this.polyRef = Refs.memoReduce((...points) => new Polygon(points), this.topLeftRef, this.topRightRef, this.bottomRightRef, this.bottomLeftRef);
        this.widthRef.onChange(width => {
            if (this.keepAspect) {
                const height = width.div(this.aspect.get());
                if (height.minus(this.height).abs().gt(Distance(0.1, 'model'))) {
                    this.height = height;
                }
                return;
            }
            this.aspect.set(width.div(this.height));
        });
        this.heightRef.onChange(height => {
            if (this.keepAspect) {
                const width = height.scale(this.aspect.get());
                if (width.minus(this.width).abs().gt(Distance(0.1, 'model'))) {
                    this.width = width;
                }
                return;
            }
            this.aspect.set(this.width.div(height));
        });
        this.centerRef.onChange(() => App.project.requestSave('rect center'));
        this.heightRef.onChange(() => App.project.requestSave('rect height'));
        this.rotationRef.onChange(() => App.project.requestSave('rect rotation'));
        this.widthRef.onChange(() => App.project.requestSave('rect width'));
        this.keepAspectRef.onChange(() => App.project.requestSave('rect aspect keeping'));
    }
    get center() {
        return this.centerRef.get();
    }
    set center(pos) {
        this.centerRef.set(pos.to('model'));
    }
    get width() {
        return this.widthRef.get();
    }
    set width(d) {
        const w = d.to('model');
        if (Number.isNaN(w.get('model'))) {
            return;
        }
        if (w.get('model') < 0.1) {
            this.widthRef.set(Distance(0.1, 'model'));
            return;
        }
        this.widthRef.set(d.to('model'));
    }
    get height() {
        return this.heightRef.get();
    }
    set height(d) {
        const h = d.to('model');
        if (Number.isNaN(h.get('model'))) {
            return;
        }
        if (h.get('model') < 0.1) {
            this.heightRef.set(Distance(0.1, 'model'));
            return;
        }
        this.heightRef.set(d.to('model'));
    }
    get top() {
        return this.topRef.get();
    }
    get left() {
        return this.leftRef.get();
    }
    get bottom() {
        return this.bottomRef.get();
    }
    get right() {
        return this.rightRef.get();
    }
    get upRad() {
        return this.upSpan.get();
    }
    get downRad() {
        return this.downSpan.get();
    }
    get leftRad() {
        return this.leftSpan.get();
    }
    get rightRad() {
        return this.rightSpan.get();
    }
    get horizontalAxis() {
        return this.horizontalAxisRef.get();
    }
    get verticalAxis() {
        return this.verticalAxisRef.get();
    }
    setTop(position) {
        this.center = this.center.plus(Vectors.between(this.topRef.get(), position).onAxis(this.upSpan.get()));
    }
    setBottom(position) {
        this.center = this.center.plus(Vectors.between(this.bottomRef.get(), position).onAxis(this.downSpan.get()));
    }
    setLeft(position) {
        this.center = this.center.plus(Vectors.between(this.leftRef.get(), position).onAxis(this.leftSpan.get()));
    }
    setRight(position) {
        this.center = this.center.plus(Vectors.between(this.rightRef.get(), position).onAxis(this.rightSpan.get()));
    }
    get rotation() {
        return this.rotationRef.get();
    }
    set rotation(angle) {
        this.rotationRef.set(angle);
    }
    get keepAspect() {
        return this.keepAspectRef.get();
    }
    set keepAspect(b) {
        this.keepAspectRef.set(b);
    }
    get edges() {
        return this.edgesRef.get();
    }
    get polygon() {
        return this.polyRef.get();
    }
    createHandle(props) {
        if (this.createdHandle)
            return;
        this.createdHandle = true;
        const main = this.entity.add(Handle, Object.assign({ getPos: () => this.center, distance: p => this.sdist(p), drag: () => this.dragItem.get(), clickable: true, draggable: true, hoverable: true, selectable: true }, props));
        const knobs = this.createResizeHandles(main.priority + 0.1);
        knobs.forEach(knob => main.addKnob(knob));
        this.createRotationLever(main);
        const compareAmount = (a, b) => a.unit === b.unit && a.value === b.value;
        this.entity.add(Form, () => {
            const form = new AutoForm();
            form.add({
                name: 'rect.aspect',
                tooltip: 'lock/unlock aspect ratio',
                kind: 'toggle',
                value: this.keepAspectRef,
                icons: {
                    on: Icons.aspectLocked,
                    off: Icons.aspectUnlocked,
                },
            });
            form.add({
                name: 'rect.width',
                label: 'length',
                kind: 'distance',
                value: this.widthRef,
                enabled: this.allowResizeH,
                min: Distance(0.1, 'model'),
            });
            form.add({
                name: 'rect.height',
                label: 'width',
                kind: 'distance',
                value: this.heightRef,
                enabled: this.allowResizeV,
                min: Distance(0.1, 'model'),
            });
            form.add({
                name: 'rect.angle',
                label: 'rotation',
                kind: 'angle',
                value: this.rotationRef,
                enabled: this.allowRotate,
            });
            return form;
        });
        return main;
    }
    sdist(position) {
        if (this.contains(position))
            return Distance(0, 'model');
        return this.edges
            .map(edge => edge.distanceFrom(position))
            .reduce((a, b) => a.min(b), Distance(Number.POSITIVE_INFINITY, 'model'));
    }
    contains(position) {
        const halfplanes = [
            [this.topRef, this.downSpan],
            [this.bottomRef, this.upSpan],
            [this.leftRef, this.rightSpan],
            [this.rightRef, this.leftSpan],
        ];
        return halfplanes.every(([origin, normal]) => Vectors.between(origin.get(), position).dot(normal.get()).sign >= 0);
    }
    containedBy(sdf) {
        return [this.topRef, this.bottomRef, this.leftRef, this.rightRef].every(pos => sdf.contains(pos.get()));
    }
    intersects(sdf) {
        if (this.containedBy(sdf))
            return true;
        const edges = [
            [this.topLeftRef, this.horizontal],
            [this.bottomLeftRef, this.horizontal],
            [this.topLeftRef, this.vertical],
            [this.topRightRef, this.vertical],
        ];
        for (const [corner, extent] of edges) {
            const hit = sdf.raycast(new SpaceRay(corner.get(), extent.get()));
            if (hit !== null && hit.time >= 0 && hit.time <= 1) {
                return true;
            }
        }
        return false;
    }
    createRotationLever(main) {
        const calcPosition = (origin, rotation) => (origin.plus(Vector(Axis.X, 'screen')
            .scale(this.width.scale(0.5).plus(Distance(50, 'screen')))
            .rotate(rotation)));
        const position = Refs.reduce({
            to: ([origin, rotation]) => calcPosition(origin, rotation),
            from: (position) => [
                this.center,
                Vectors.between(this.center, position).angle()
            ],
            compareValues: Rectangular.posEq,
        }, this.centerRef, this.rotationRef);
        main.entity.add(Lever, main, Refs.ro(this.centerRef), position, `url('${Icons.rotate}') 8 8, pointer`, this.allowRotate);
    }
    createResizeHandles(priority) {
        const resize = (name, frame, priority) => {
            const distanceFunc = Refs.memoReduce((frame, horizontal, vertical) => {
                const hasX = frame.horizontal.mag2().nonzero;
                const hasY = frame.vertical.mag2().nonzero;
                if (hasX && hasY) {
                    const circle = new Circle(frame.origin, Distance(10, 'screen'));
                    return (p) => circle.sdist(p);
                }
                if (hasX) {
                    // left or right edge
                    const edge = new MemoEdge(frame.origin.splus(-0.5, vertical), frame.origin.splus(+0.5, vertical));
                    return (p) => edge.distanceFrom(p);
                }
                if (hasY) {
                    // top or bottom edge
                    const edge = new MemoEdge(frame.origin.splus(-0.5, horizontal), frame.origin.splus(+0.5, horizontal));
                    return (p) => edge.distanceFrom(p);
                }
                // we got passed in all zeroes, what gives
                return (p) => Distance(Number.POSITIVE_INFINITY, 'model');
            }, frame, this.horizontal, this.vertical);
            return this.entity.ecs.createEntity().add(Handle, {
                priority: priority,
                getPos: () => frame.get().origin,
                distance: p => distanceFunc.get()(p),
                cursor: () => getResizeCursor(Vectors.between(this.center, frame.get().origin), true),
                clickable: false,
                selectable: false,
                hoverable: false,
                draggable: true,
                control: true,
                visible: () => {
                    if (!this.allowResizeH.get() && frame.get().horizontal.mag2().sign > 0)
                        return false;
                    if (!this.allowResizeV.get() && frame.get().vertical.mag2().sign > 0)
                        return false;
                    return true;
                },
                drag: () => {
                    return {
                        kind: 'point',
                        name,
                        get: () => frame.get().origin,
                        set: p => {
                            const { origin, horizontal, vertical } = frame.get();
                            let delta = Vectors.between(origin, p);
                            const startWidth = this.width;
                            const startHeight = this.height;
                            if (this.keepAspect
                                && horizontal.mag2().nonzero
                                && vertical.mag2().nonzero) {
                                const axis1 = this.vertical.get().plus(this.horizontal.get()).unit();
                                const axis2 = this.vertical.get().plus(this.horizontal.get().neg()).unit();
                                const hv = horizontal.plus(vertical);
                                const axis = hv.dot(axis1).abs().ge(hv.dot(axis2).abs()) ? axis1 : axis2;
                                delta = delta.onAxis(axis);
                                const startWidth = this.width;
                                const startHeight = this.height;
                                this.width = this.width.plus(delta.dot(horizontal));
                            }
                            else {
                                this.width = this.width.plus(delta.dot(horizontal));
                                this.height = this.height.plus(delta.dot(vertical));
                            }
                            this.center = this.center
                                .splus(this.width.minus(startWidth).scale(0.5), horizontal)
                                .splus(this.height.minus(startHeight).scale(0.5), vertical);
                        },
                        disableWhenMultiple: true,
                    };
                },
            });
        };
        const up = Refs.memo(this.upSpan, v => v.unit());
        const down = Refs.memo(this.downSpan, v => v.unit());
        const left = Refs.memo(this.leftSpan, v => v.unit());
        const right = Refs.memo(this.rightSpan, v => v.unit());
        const zero = Refs.ofRo(Vectors.zero('model'));
        const frameOf = (origin, horizontal, vertical) => Refs.memoReduce((origin, horizontal, vertical) => ({
            origin, horizontal, vertical,
        }), origin, horizontal, vertical);
        return [
            resize('top', frameOf(this.topRef, zero, up), priority),
            resize('bottom', frameOf(this.bottomRef, zero, down), priority),
            resize('left', frameOf(this.leftRef, left, zero), priority),
            resize('right', frameOf(this.rightRef, right, zero), priority),
            resize('top-left', frameOf(this.topLeftRef, left, up), priority + 0.1),
            resize('top-right', frameOf(this.topRightRef, right, up), priority + 0.1),
            resize('bottom-left', frameOf(this.bottomLeftRef, left, down), priority + 0.1),
            resize('bottom-right', frameOf(this.bottomRightRef, right, down), priority + 0.1),
        ];
    }
    computeDragItem() {
        const points = [
            { name: 'center', ref: this.centerRef },
            { name: 'top midpoint', ref: this.topRef },
            { name: 'bottom midpoint', ref: this.bottomRef },
            { name: 'left midpoint', ref: this.leftRef },
            { name: 'right midpoint', ref: this.rightRef },
            { name: 'top-left corner', ref: this.topLeftRef },
            { name: 'top-right corner', ref: this.topRightRef },
            { name: 'bottom-left corner', ref: this.bottomLeftRef },
            { name: 'bottom-right corner', ref: this.bottomRightRef },
        ];
        return {
            kind: 'group',
            name: 'rect',
            aggregate: 'all',
            items: points.map(({ name, ref }, i) => {
                const delta = () => Vectors.between(this.centerRef.get(), ref.get());
                return {
                    kind: 'point',
                    name,
                    get: () => ref.get(),
                    set: p => this.centerRef.set(p.minus(delta())),
                    disableWhenMultiple: i > 0,
                };
            }),
        };
    }
    toJson() {
        const handle = this.entity.maybe(Handle);
        return {
            factory: this.constructor.name,
            arguments: [{
                    center: MoreJson.position.to(this.center),
                    width: MoreJson.distance.to(this.width),
                    height: MoreJson.distance.to(this.height),
                    rotation: MoreJson.angle.to(this.rotation),
                    keepAspect: this.keepAspect,
                    createdHandle: this.createdHandle,
                    handleProps: {
                        clickable: handle === null || handle === void 0 ? void 0 : handle.clickable,
                        draggable: handle === null || handle === void 0 ? void 0 : handle.draggable,
                        hoverable: handle === null || handle === void 0 ? void 0 : handle.hoverable,
                        selectable: handle === null || handle === void 0 ? void 0 : handle.selectable,
                        priority: handle === null || handle === void 0 ? void 0 : handle.priority,
                        tools: handle === null || handle === void 0 ? void 0 : handle.tools,
                    },
                }],
        };
    }
}
_a = SOLO;
Rectangular.posEq = (one, two) => {
    if (one.space !== two.space)
        return false;
    const a = one.get(one.space);
    const b = two.get(two.space);
    return Math.abs(a.x - b.x) < 0.01
        && Math.abs(a.y - b.y) < 0.01;
};
Rectangular.distEq = (one, two) => {
    if (one.space !== two.space)
        return false;
    const a = one.get(one.space);
    const b = two.get(two.space);
    return Math.abs(a - b) < 0.01;
};
Rectangular.angleEq = (one, two) => {
    if (one.space !== two.space)
        return false;
    const a = unwrap(one.get('model'));
    const b = unwrap(two.get('model'));
    return Math.abs(a - b) < 0.001;
};
ComponentFactories.register(Rectangular, (entity, props) => {
    const rect = entity.getOrCreate(Rectangular);
    // don't try to keep aspect while we're loading dimensions
    rect.keepAspect = false;
    rect.center = MoreJson.position.from(props.center);
    rect.width = MoreJson.distance.from(props.width);
    rect.height = MoreJson.distance.from(props.height);
    rect.rotation = MoreJson.angle.from(props.rotation);
    rect.keepAspect = props.keepAspect;
    if (props.createdHandle) {
        rect.createHandle(props.handleProps || {});
    }
    return rect;
});
const RectangularRenderer = (ecs) => {
    App.canvas.lineWidth = 1;
    App.canvas.setLineDash([2, 2]);
    App.ecs.getComponents(Rectangular).forEach(rect => {
        var _b;
        if (rect.entity.has(Furniture))
            return;
        const active = (_b = rect.entity.maybe(Handle)) === null || _b === void 0 ? void 0 : _b.isActive;
        const hasTexture = rect.entity.has(Imaged) || rect.entity.has(Furniture);
        if (hasTexture && !active) {
            return; // don't need to render if image is there
        }
        App.canvas.strokeStyle = active ? BLUE : 'gray';
        App.canvas.polygon(rect.polygon);
        App.canvas.stroke();
    });
    App.canvas.setLineDash([]);
};
"use strict";
class StatefulUiDragListener {
    constructor(listener) {
        this.listener = listener;
        this.state = null;
    }
    onStart(event) {
        this.state = this.listener.onStart(event);
    }
    onUpdate(event) {
        if (this.state === null)
            return;
        this.listener.onUpdate(event, this.state);
    }
    onEnd(event) {
        if (this.state === null)
            return;
        this.listener.onEnd(event, this.state);
        this.state = null;
    }
}
class UiEventDispatcher {
    constructor(containingClass, label) {
        this.forwards = new Array();
        this.drag = new MultiMap();
        this.mouse = new MultiMap();
        this.key = new MultiMap();
        this.label = typeof label === 'undefined'
            ? containingClass.name
            : `${containingClass.name}: ${label}`;
    }
    addDragListener(listener) {
        const wrap = new StatefulUiDragListener(listener);
        this.onDrag('start', e => wrap.onStart(e));
        this.onDrag('update', e => wrap.onUpdate(e));
        this.onDrag('end', e => wrap.onEnd(e));
    }
    onDrag(kind, listener) {
        this.drag.add(kind, listener);
    }
    onMouse(kind, listener) {
        this.mouse.add(kind, listener);
    }
    onKey(kind, listener) {
        this.key.add(kind, listener);
    }
    forward(dispatch) {
        this.forwards.push(dispatch);
    }
    handleDrag(event) {
        this.forwards.forEach(f => f.handleDrag(event));
        this.drag.get(event.kind).forEach(handle => handle(event));
    }
    handleMouse(event) {
        this.forwards.forEach(f => f.handleMouse(event));
        this.mouse.get(event.kind).forEach(handle => handle(event));
    }
    handleKey(event) {
        this.forwards.forEach(f => f.handleKey(event));
        this.key.get(event.kind).forEach(handle => handle(event));
    }
}
"use strict";
const PINK = '#F5A9B8';
const BLUE = '#5BCEFA';
class Form extends Component {
    constructor(entity, factory) {
        super(entity);
        this.factories = [];
        if (typeof factory !== 'undefined') {
            this.factories.push(factory);
        }
    }
    add(f) {
        this.factories.push(f);
    }
    get form() {
        return AutoForm.union(this.factories.map(f => f()));
    }
}
class SnapState {
    constructor() {
        this.enableByDefaultRef = Refs.of(false);
        this.enabledRef = Refs.of(false);
        this.snapToLocalRef = Refs.of(false);
        this.snapToGlobalRef = Refs.of(false);
        this.snapToGeometryRef = Refs.of(false);
        this.snapRadius = Refs.of(Distance(25, 'screen'));
        this.angleThreshold = Refs.of(Degrees(10), (a, b) => unwrap(a) === unwrap(b));
    }
    get enabled() {
        return this.enableByDefaultRef.get();
    }
    set enabled(v) {
        this.enableByDefaultRef.set(v);
    }
    get snapToLocal() {
        return this.snapToLocalRef.get();
    }
    set snapToLocal(v) {
        this.snapToLocalRef.set(v);
    }
    get snapToGlobal() {
        return this.snapToGlobalRef.get();
    }
    set snapToGlobal(v) {
        this.snapToGlobalRef.set(v);
    }
    get snapToGeometry() {
        return this.snapToGeometryRef.get();
    }
    set snapToGeometry(v) {
        this.snapToGeometryRef.set(v);
    }
}
class UiState {
    constructor() {
        this.events = new UiEventDispatcher(UiState);
        this.grabRadius = Distance(10, 'screen');
        this.mouse = {
            position: Position(Point.ZERO, 'screen'),
            buttons: 0,
            pressed: false,
            dragging: false,
            start: Position(Point.ZERO, 'screen'),
            distanceDragged: Distance(0, 'screen'),
        };
        this.keysPressed = new DefaultMap(() => false);
        this.swappedTool = null;
        this.currentSnapResult = null;
        this.preferredSnap = null;
        this.snapping = new SnapState();
    }
    update() {
        App.tools.current.update();
        if (this.dragging) {
            this.renderSnap();
        }
        for (const s of this.selection) {
            for (const lever of s.entity.get(Lever)) {
                if (lever.visible) {
                    this.renderLever(lever);
                }
            }
        }
    }
    isKeyPressed(key) {
        return this.keysPressed.get(key);
    }
    get pressedKeys() {
        // little does the map api know that its
        // keys are literal keys this time!!! >:D
        return Array.from(this.keysPressed.keys())
            .filter(key => this.keysPressed.get(key));
    }
    get multiSelecting() {
        return this.keysPressed.get('Shift');
    }
    get mousePos() {
        return this.mouse.position;
    }
    get dragging() {
        return this.mouse.dragging;
    }
    cancelDrag() {
        if (this.mouse.dragging) {
            const base = {
                start: this.mouse.start,
                position: this.mouse.start,
                delta: Vector(Vec.ZERO, 'screen'),
                primary: true,
            };
            this.events.handleDrag(Object.assign({ kind: 'update' }, base));
            this.events.handleDrag(Object.assign({ kind: 'end' }, base));
        }
        this.mouse.dragging = false;
        this.mouse.pressed = false;
        this.clearDragging();
    }
    get selection() {
        return new Set(App.ecs.getComponents(Selected)
            .map(s => s.entity)
            .filter(s => s.has(Handle))
            .map(s => s.only(Handle)));
    }
    clearSelection() {
        App.ecs.getComponents(Selected).map(s => s.entity.only(Handle)).forEach(e => {
            e.selected = false;
            e.hovered = false;
            e.dragging = false;
        });
        this.updateForms();
    }
    clearDragging() {
        App.ecs.getComponents(Dragging).map(s => s.entity.only(Handle)).forEach(e => {
            e.dragging = false;
        });
    }
    setSelection(...handles) {
        const current = this.selection;
        const updated = new Set(handles);
        for (const h of current) {
            if (!updated.has(h)) {
                h.selected = false;
            }
        }
        for (const h of updated) {
            h.selected = true;
        }
        this.updateForms();
    }
    addSelection(...handles) {
        handles.forEach(h => {
            h.selected = true;
        });
        this.updateForms();
    }
    select(...handles) {
        if (handles.every(h => h.isSelected))
            return;
        if (this.multiSelecting) {
            this.addSelection(...handles);
        }
        else {
            this.setSelection(...handles);
        }
    }
    loopSelect() {
        var _a, _b;
        const collected = new Set();
        const frontier = [...this.selection];
        while (frontier.length > 0) {
            const handle = frontier.pop();
            if (collected.has(handle)) {
                continue;
            }
            collected.add(handle);
            if (handle.entity.has(Wall)) {
                handle.entity.only(Wall).getConnectedLoop()
                    .map(wall => wall.entity.only(Handle))
                    .forEach(h => collected.add(h));
            }
            else if (handle.entity.has(WallJoint)) {
                const dst = (_b = (_a = handle.entity.only(WallJoint).outgoing) === null || _a === void 0 ? void 0 : _a.entity) === null || _b === void 0 ? void 0 : _b.only(Handle);
                if (dst)
                    frontier.push(dst);
            }
        }
        this.setSelection(...Array.from(collected).filter(h => h.selectable));
    }
    selectAll() {
        this.setSelection(...App.ecs.getComponents(Handle)
            .filter(h => h.selectable && h.isForTool(App.tools.current.name)));
    }
    deleteSelected() {
        const selected = this.selection;
        if (selected.size === 0) {
            return;
        }
        this.cancelDrag();
        this.clearSelection();
        selected.forEach(s => s.delete());
        App.project.requestSave('selection deleted');
    }
    clearHovered() {
        App.ecs.getComponents(Hovered).forEach(h => h.unhover());
    }
    flip(axis) {
        var _a;
        for (const handle of this.selection) {
            (_a = handle.entity.maybe(Furniture)) === null || _a === void 0 ? void 0 : _a.flip(axis);
        }
    }
    getDragClosure(type = 'minimal', selection) {
        const closure = Drags.closure(type, ...selection.map(s => s.getDragItem()));
        if (this.multiSelecting) {
            closure.points = closure.points.filter(p => !p.disableWhenMultiple);
        }
        closure.snaps.push({
            kind: 'point',
            category: 'grid',
            name: 'grid',
            func: pos => Grid.getGrid().snap(pos),
            closeEnough: drag => {
                const grid = Grid.getGrid();
                const delta = Distances.between(grid.snap(drag.end), drag.end);
                return delta.le(grid.spacing.scale(0.5));
            },
        });
        const theta = unwrap(this.snapping.angleThreshold.get());
        closure.snaps.push({
            kind: 'axis',
            category: 'global',
            name: 'X-Axis',
            direction: Vector(Axis.X, 'screen'),
            closeEnough: drag => {
                const angle = Math.abs(unwrap(toDegrees(drag.tangent.angle().get('screen'))));
                return Math.abs(angle) < theta || Math.abs(angle - 180) < theta;
            },
        });
        closure.snaps.push({
            kind: 'axis',
            category: 'global',
            name: 'Y-Axis',
            direction: Vector(Axis.Y, 'screen'),
            closeEnough: drag => {
                const angle = Math.abs(unwrap(toDegrees(drag.tangent.angle().get('screen'))));
                return Math.abs(angle - 90) < theta || Math.abs(angle - 270) < theta;
            },
        });
        return closure;
    }
    isSnapEnabled(snap) {
        if (!this.snapping.enabled) {
            return false;
        }
        if (snap.category === 'grid') {
            return App.settings.snapGrid.get();
        }
        if (snap.category === 'local') {
            return this.snapping.snapToLocalRef.get();
        }
        if (snap.category === 'guide') {
            return this.snapping.snapToGeometryRef.get();
        }
        if (snap.category === 'geometry') {
            return this.snapping.snapToGeometryRef.get();
        }
        if (snap.category === 'global') {
            return this.snapping.snapToGlobalRef.get();
        }
        return impossible(snap.category);
    }
    initiateDrag() {
        const event = {
            kind: 'start',
            primary: true,
            start: this.mousePos,
            position: this.mousePos,
            delta: Vectors.zero('screen'),
        };
        this.mouse.pressed = true;
        this.mouse.dragging = true;
        this.mouse.distanceDragged = Distance(0, 'screen');
        App.tools.current.events.handleDrag(event);
    }
    getDefaultDragHandler(filter) {
        const dispatcher = new UiEventDispatcher(UiState, 'default drag handler');
        const pickCursor = (handle) => {
            const counter = new Counter();
            let max = 0;
            for (const h of handle) {
                max = Math.max(max, counter.inc(h.getContextualCursor()));
            }
            if (max === 0)
                return 'grabbing';
            return Array.from(counter.keys()).filter(k => counter.get(k) === max)[0];
        };
        dispatcher.addDragListener({
            onStart: e => {
                const hovering = this.getHandleAt(e.start, filter);
                const selection = [];
                if (hovering !== null) {
                    selection.push(hovering);
                    if (hovering.selectable) {
                        const seen = new Set(selection);
                        const collect = (h) => {
                            if (seen.has(h))
                                return;
                            seen.add(h);
                            selection.push(h);
                        };
                        this.selection.forEach(collect);
                    }
                }
                else {
                    this.selection.forEach(s => selection.push(s));
                }
                App.pane.style.cursor = pickCursor(selection);
                selection.forEach(h => { h.dragging = true; });
                selection.forEach(h => h.events.handleDrag(e));
                const closure = this.getDragClosure('minimal', selection);
                const starts = closure.points.map(point => point.get());
                return { closure, starts, selection };
            },
            onUpdate: (e, { closure, starts, selection }) => {
                if (App.ecs.getComponents(Dragging).length === 0)
                    return;
                const drag = new Drag(e.start, e.position);
                const preferred = this.preferredSnap !== null
                    ? closure.snaps.filter(s => s.name === this.preferredSnap)[0]
                    : undefined;
                const result = preferred ? {
                    snap: preferred,
                    item: closure.points[0],
                    snapped: drag.snapped(preferred),
                    original: drag,
                    distance: Distances.between(drag.snapped(preferred).end, drag.end),
                } : Drags.chooseSnap({ drag, starts, closure }, snap => this.isSnapEnabled(snap));
                this.currentSnapResult = result;
                const delta = ((result === null || result === void 0 ? void 0 : result.snapped) || drag).delta;
                closure.points.forEach((point, i) => point.set(starts[i].plus(delta)));
                selection.forEach(h => h.events.handleDrag(e));
            },
            onEnd: (e, { selection }) => {
                selection.forEach(h => h.events.handleDrag(e));
                const selectable = selection.filter(s => s.selectable && !s.control);
                if (selectable.length > 0) {
                    this.setSelection(...selectable);
                }
                this.clearDragging();
                this.currentSnapResult = null;
                this.preferredSnap = null;
                App.project.requestSave('drag completed');
            },
        });
        return dispatcher;
    }
    get defaultDragHandler() {
        return this.getDefaultDragHandler(h => h.draggable);
    }
    renderKnob(handle) {
        const knob = handle.knob;
        if (knob === null) {
            return;
        }
        const poly = knob.poly();
        App.canvas.polygon(poly);
        if (typeof knob.fill !== 'undefined') {
            App.canvas.fillStyle = knob.fill;
            App.canvas.fill();
        }
        if (typeof knob.stroke !== 'undefined') {
            App.canvas.lineWidth = 1;
            App.canvas.strokeStyle = knob.stroke;
            App.canvas.stroke();
        }
    }
    renderLever(lever) {
        App.canvas.lineWidth = 1;
        App.canvas.setLineDash([]);
        App.canvas.strokeStyle = BLUE;
        const src = lever.origin.get();
        const dst = lever.position.get();
        const tangent = lever.tangent;
        const srcRad = Distance(2, 'screen');
        const dstRad = Distance(5, 'screen');
        const margin = Distance(1, 'screen');
        App.canvas.strokeCircle(src, srcRad);
        App.canvas.strokeLine(src.splus(srcRad.plus(margin), tangent), dst.splus(dstRad.plus(margin), tangent.neg()));
        App.canvas.lineWidth = 2;
        App.canvas.strokeCircle(dst, dstRad);
        App.canvas.lineWidth = 1;
        App.canvas.setLineDash([]);
    }
    renderSnap() {
        const result = this.currentSnapResult;
        if (result === null)
            return;
        const color = this.getSnapColor(result.snap);
        if (result.snap.kind === 'axis' || result.snap.kind === 'vector') {
            const screenSize = Distance(Math.max(App.viewport.screen_width, App.viewport.screen_height), 'screen');
            const axis = new SpaceEdge(result.snapped.end.splus(screenSize, result.snapped.delta.neg()), result.snapped.end.splus(screenSize, result.snapped.delta));
            App.canvas.strokeStyle = color;
            App.canvas.strokeLine(axis.src, axis.dst);
            App.canvas.text({
                text: `${result.item.name} to ${result.snap.name}`,
                fill: color,
                point: axis.midpoint.splus(Distance(App.settings.fontSize, 'screen'), axis.normal),
                axis: axis.tangent,
                keepUpright: true,
                align: 'center',
                baseline: 'bottom',
            });
        }
        else {
            App.canvas.arrow(result.original.end, result.snapped.end);
            App.canvas.fillStyle = color;
            App.canvas.fill();
            App.canvas.text({
                text: `${result.item.name} to ${result.snap.name}`,
                point: result.snapped.end.splus(Distance(20, 'screen'), Vector(Axis.X, 'screen')),
                keepUpright: true,
                align: 'left',
                baseline: 'middle',
                fill: color,
            });
        }
    }
    setHovered(...handles) {
        const set = new Set(handles);
        handles.forEach(h => { h.hovered = true; });
        App.ecs.getComponents(Hovered)
            .map(h => h.entity.only(Handle))
            .forEach(h => { h.hovered = set.has(h); });
    }
    getHandleAt(position, filter, includeOtherTools) {
        const radius = this.grabRadius;
        const handles = App.ecs.getComponents(Handle);
        // sort descending
        handles.sort((a, b) => b.priority - a.priority);
        let choice = null;
        let choiceDistance = 0;
        for (const handle of handles) {
            if (!handle.visible) {
                continue;
            }
            if (!includeOtherTools && !handle.isForTool(App.tools.current.name)) {
                continue;
            }
            if (typeof filter !== 'undefined' && !filter(handle)) {
                continue;
            }
            if (this.multiSelecting && handle.getDragClosure('complete').points
                .every(p => p.disableWhenMultiple)) {
                continue;
            }
            if (choice !== null && choice.priority > handle.priority) {
                // the handles are sorted by descending priority, so we
                // can exit early here. 
                return choice;
            }
            const handleDistance = handle.distanceFrom(position).get('screen');
            if (handleDistance > radius.get('screen')) {
                continue;
            }
            if (choice === null || handleDistance < choiceDistance) {
                choice = handle;
                choiceDistance = handleDistance;
            }
        }
        return choice;
    }
    snapPoint(pos) {
        // TODO: should prob plug into formalized snapping system
        if (this.snapping.enabled && App.settings.snapGrid.get()) {
            return Grid.getGrid().snap(pos);
        }
        return pos;
    }
    updateForms() {
        const forms = Array.from(this.selection)
            .map(handle => handle.entity.get(Form))
            .map(forms => AutoForm.union(forms.map(form => form.form)));
        const form = AutoForm.union(forms);
        App.gui.selection.clear();
        form.inflate(App.gui.selection);
    }
    getSnapColor(snap) {
        if (snap.name === 'X-Axis')
            return BLUE;
        if (snap.name === 'Y-Axis')
            return PINK;
        if (snap.name === 'grid')
            return 'gray';
        return 'orange';
    }
    setup() {
        this.events.forward({
            handleDrag: e => App.tools.current.events.handleDrag(e),
            handleKey: e => App.tools.current.events.handleKey(e),
            handleMouse: e => App.tools.current.events.handleMouse(e),
        });
        this.events.onKey('keydown', e => {
            if (this.keysPressed.get(e.key)) {
                return;
            }
            this.keysPressed.set(e.key, true);
            if (this.dragging) {
                if (e.key === 'Control') {
                    this.snapping.enabled = !this.snapping.enabled;
                    if (!this.snapping.enabled) {
                        this.preferredSnap = null;
                    }
                }
                else if (e.key === 'x') {
                    this.preferredSnap = 'X-Axis';
                }
                else if (e.key === 'y') {
                    this.preferredSnap = 'Y-Axis';
                }
            }
            if (e.key === 'Delete' || e.key === 'Backspace') {
                this.deleteSelected();
            }
            if (e.key === 'Alt') {
                if (App.tools.current.name !== 'pan tool') {
                    App.tools.pushTool();
                    App.tools.set('pan tool');
                    this.initiateDrag();
                }
                e.preventDefault();
                return;
            }
            if (App.actions.evaluateKeybindings()) {
                e.preventDefault();
            }
        });
        this.events.onKey('keyup', e => {
            this.keysPressed.delete(e.key);
            if (e.key === 'Alt') {
                if (App.tools.popTool()) {
                    e.preventDefault();
                }
            }
        });
        window.addEventListener('focus', () => {
            this.keysPressed.clear();
            this.cancelDrag();
        });
        const makeKeyEvent = (kind, e) => ({
            kind,
            key: e.key,
            which: e.which,
            preventDefault: () => e.preventDefault(),
        });
        // mouse event util
        const isPrimary = (buttons) => {
            return typeof buttons === 'undefined' || buttons === 1;
        };
        const getMousePosition = (e) => {
            const rect = App.pane.getBoundingClientRect();
            return Position(new Point(e.clientX - rect.left, e.clientY - rect.top), 'screen');
        };
        const makeMouseEvent = (kind, e) => ({
            kind,
            position: getMousePosition(e),
            primary: isPrimary(this.mouse.buttons),
            double: false,
        });
        // mouse drag state management
        const dragThreshold = Distance(5, 'screen');
        const makeDragEvent = (e, kind) => ({
            kind,
            start: this.mouse.start,
            position: e.position,
            delta: Vectors.between(this.mouse.start, e.position),
            primary: e.primary,
        });
        const ignoreKeyEventsFrom = new Set([
            'input',
            'textarea',
        ]);
        const shouldIgnoreKeyEvent = (e) => {
            if (e.target && e.target instanceof HTMLElement) {
                return ignoreKeyEventsFrom.has(e.target.tagName.toLocaleLowerCase());
            }
            return false;
        };
        window.addEventListener('keydown', e => {
            if (shouldIgnoreKeyEvent(e))
                return;
            this.events.handleKey(makeKeyEvent('keydown', e));
        });
        window.addEventListener('keyup', e => {
            if (shouldIgnoreKeyEvent(e))
                return;
            this.events.handleKey(makeKeyEvent('keyup', e));
        });
        App.pane.addEventListener('contextmenu', e => e.preventDefault());
        App.pane.addEventListener('mousedown', e => {
            var _a;
            e.preventDefault();
            this.mouse.buttons = e.buttons;
            const activeElement = document.activeElement;
            if (((_a = activeElement === null || activeElement === void 0 ? void 0 : activeElement.tagName) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase()) === 'input') {
                activeElement.blur();
            }
            const event = makeMouseEvent('down', e);
            if (!event.primary) {
                const tool = App.tools.current;
                if (tool.name !== 'pan tool') {
                    App.tools.set('pan tool');
                    this.swappedTool = tool.name;
                }
            }
            this.mouse.start = event.position;
            this.mouse.distanceDragged = Distance(0, 'screen');
            this.mouse.pressed = true;
            this.events.handleMouse(makeMouseEvent('down', e));
            // close pop-up windows
            if (event.primary) {
                App.ecs.getComponents(Popup)
                    .filter(p => p.closeOnUnfocus)
                    .forEach(p => p.hide());
            }
        });
        App.pane.addEventListener('mousemove', e => {
            const event = makeMouseEvent('move', e);
            this.mouse.position = event.position;
            this.events.handleMouse(event);
            if (this.mouse.pressed) {
                if (!this.mouse.dragging) {
                    this.mouse.distanceDragged = Spaces.calc(Distance, (a, b) => Math.max(a, b), this.mouse.distanceDragged, Distances.between(this.mouse.start, event.position));
                    if (this.mouse.distanceDragged.get('screen') >= dragThreshold.get('screen')) {
                        this.mouse.dragging = true;
                        this.events.handleDrag(makeDragEvent(event, 'start'));
                    }
                }
                if (this.mouse.dragging) {
                    this.events.handleDrag(makeDragEvent(event, 'update'));
                }
            }
        });
        App.pane.addEventListener('mouseup', e => {
            const event = makeMouseEvent('up', e);
            if (!event.primary && this.swappedTool !== null) {
                App.tools.set(this.swappedTool);
                this.swappedTool = null;
            }
            this.events.handleMouse(event);
            if (this.mouse.dragging) {
                this.events.handleDrag(makeDragEvent(event, 'end'));
            }
            else {
                this.events.handleMouse(makeMouseEvent('click', e));
            }
            this.mouse.dragging = false;
            this.mouse.pressed = false;
        });
    }
}
"use strict";
var _a, _b;
class PhysNode extends Component {
    constructor(entity) {
        super(entity);
        this[_a] = true;
        this.pointRef = Refs.of(Point.ZERO, PhysNode.CMP_POINT);
        this.velocity = Vec.ZERO;
        this.acceleration = Vec.ZERO;
        this.forceAccum = Vec.ZERO;
        this.mass = 1.0;
        this.dragFactor = 0.5;
        this.position = this.pointRef.map({
            to: pt => Position(pt, 'model'),
            from: pos => pos.get('model'),
            compareValues: areEq,
        });
    }
    get pos() {
        return this.position.get();
    }
    set pos(p) {
        this.position.set(p);
    }
    update() {
        const dt = Time.delta;
        // fake physics: if there are no forces, we don't move
        if (this.forceAccum.mag() < 0.1) {
            this.velocity = Vec.ZERO;
        }
        const dragForce = this.velocity.scale(-this.dragFactor * this.velocity.mag());
        this.velocity = this.velocity.splus(dt / this.mass, dragForce);
        this.velocity = this.velocity.splus(dt, this.acceleration);
        this.velocity = this.velocity.splus(dt / this.mass, this.forceAccum);
        const delta = this.velocity.scale(dt);
        if (delta.mag2() > 0.0001) {
            this.pointRef.set(this.pointRef.get().plus(delta));
        }
        this.clearForces();
    }
    addForce(f) {
        this.forceAccum = this.forceAccum.plus(f.get('model'));
    }
    clearForces() {
        this.forceAccum = Vec.ZERO;
    }
    intersects(sdf) {
        return sdf.contains(this.pos);
    }
    containedBy(sdf) {
        return sdf.contains(this.pos);
    }
    toJson() {
        return {
            factory: this.constructor.name,
            arguments: [MoreJson.position.to(this.pos)],
        };
    }
}
_a = SOLO;
PhysNode.CMP_POINT = (a, b) => {
    return Math.abs(a.x - b.x) < 0.001 && Math.abs(a.y - b.y) < 0.001;
};
ComponentFactories.register(PhysNode, (entity, pos) => {
    const node = entity.getOrCreate(PhysNode);
    node.pos = MoreJson.position.from(pos);
    return node;
});
class MemoEdge {
    constructor(src, dst) {
        this.src = src;
        this.dst = dst;
        this._vector = Memo(() => Vectors.between(this.src, this.dst));
        this._tangent = Memo(() => this.vector.unit());
        this._normal = Memo(() => this.tangent.r90());
        this._midpoint = Memo(() => this.lerp(0.5));
        this._length = Memo(() => Distances.between(this.src, this.dst));
    }
    get vector() { return this._vector(); }
    get tangent() { return this._tangent(); }
    get normal() { return this._normal(); }
    get midpoint() { return this._midpoint(); }
    get length() { return this._length(); }
    lerp(s) {
        return this.src.lerp(s, this.dst);
    }
    unlerp(p) {
        const vector = this.vector;
        return Vectors.between(this.src, p).dot(vector).div(vector.mag2());
    }
    closestPoint(pos) {
        const s = this.unlerp(pos);
        if (s <= 0)
            return this.src;
        if (s >= 1)
            return this.dst;
        return this.lerp(s);
    }
    distanceFrom(pos) {
        return Distances.between(pos, this.closestPoint(pos));
    }
    intersection(other) {
        const denominator = this.vector.dot(other.normal);
        if (denominator.sign === 0)
            return null;
        const time = Vectors.between(this.src, other.src).dot(other.normal)
            .div(denominator);
        if (time < 0 || time > 1)
            return null;
        const hit = this.lerp(time);
        const s = other.unlerp(hit);
        if (s < 0 || s > 1)
            return null;
        return hit;
    }
}
class PhysEdge extends Component {
    constructor(entity, srcRef, dstRef) {
        super(entity);
        this.srcRef = srcRef;
        this.dstRef = dstRef;
        this[_b] = true;
        this.edgeRef = Refs.memo(Refs.reduceRo(a => a, Refs.flatMapRo(srcRef, p => p.position), Refs.flatMapRo(dstRef, p => p.position)), ([a, b]) => new MemoEdge(a, b));
    }
    get edge() {
        return this.edgeRef.get();
    }
    addForces({ src, dst }) {
        this.srcRef.get().addForce(src);
        this.dstRef.get().addForce(dst);
    }
    addForce(force) {
        this.addForces({
            src: force,
            dst: force,
        });
    }
    intersects(sdf) {
        if (this.containedBy(sdf))
            return true;
        const edge = this.edge;
        // lazy sampling is good enough for now
        const samples = 100;
        for (let i = 0; i < samples; i++) {
            if (sdf.contains(edge.lerp(1.0 * i / samples)))
                return true;
        }
        return false;
    }
    containedBy(sdf) {
        const edge = this.edge;
        return sdf.contains(edge.src) && sdf.contains(edge.dst);
    }
}
_b = SOLO;
const Kinematics = (ecs) => {
    const enabled = App.settings.kinematics.get() && !App.ui.dragging;
    const positions = ecs.getComponents(PhysNode);
    if (!enabled) {
        // make sure we're not accumulating forces in the meantime
        positions.forEach(p => p.clearForces());
        return;
    }
    const points = positions.map(p => p.pos);
    positions.forEach(p => p.update());
    // correct drift
    if (positions.length > 0) {
        let dx = 0.;
        let dy = 0.;
        for (let i = 0; i < positions.length; i++) {
            const a = points[i].get('model');
            const b = positions[i].pos.get('model');
            dx += b.x - a.x;
            dy += b.y - a.y;
        }
        dx /= positions.length;
        dy /= positions.length;
        const drift = Vector(new Vec(dx, dy), 'model');
        if (drift.get('model').mag2() > 0) {
            positions.forEach(p => {
                p.pos = p.pos.minus(drift);
            });
        }
    }
};
"use strict";
const signToErrorStatus = (s) => {
    if (s === -1)
        return 'under';
    if (s === 0)
        return 'satisfied';
    if (s === 1)
        return 'over';
    return impossible(s);
};
class Constraint extends Component {
    constructor(entity) {
        super(entity);
        this.enabledRef = Refs.of(false);
        this.tensionRef = Refs.of(0.5);
        this.priority = 0;
        this.addKind(Constraint);
        this.enabledRef.onChange(e => {
            if (e)
                this.onEnable();
            else
                this.onDisable();
            App.project.requestSave(`constraint ${this.name} enabled`);
        });
        this.tensionRef.onChange(_ => App.project.requestSave(`${this.name} tension changed`));
    }
    enforce() { }
    get kinematic() {
        return true;
    }
    get enabled() {
        return this.enabledRef.get();
    }
    set enabled(enabled) {
        this.enabledRef.set(enabled);
    }
    get tension() {
        return this.tensionRef.get();
    }
    set tension(t) {
        this.tensionRef.set(t);
    }
    get influence() {
        if (!this.enabled)
            return 0;
        const dt = clamp01(Time.delta);
        const a = lerp(this.tension, 0, dt);
        const b = lerp(this.tension, dt, 1);
        return lerp(this.tension, a, b);
    }
    // for subclasses to override
    onEnable() { }
    onDisable() { }
}
class FixedConstraint extends Constraint {
    constructor(entity, getPoints, setPoints) {
        super(entity);
        this.getPoints = getPoints;
        this.setPoints = setPoints;
        this.targets = [];
        this.tension = 1.0;
        this.priority = 5;
        this.enabled = false;
        this.entity.add(Form, () => {
            const form = new AutoForm();
            const lockField = form.add({
                name: 'lock position',
                kind: 'toggle',
                value: this.enabledRef,
                icons: {
                    on: Icons.posLocked,
                    off: Icons.posUnlocked,
                },
            });
            return form;
        });
    }
    get kinematic() {
        return this.tension < 1;
    }
    getTargets() {
        return this.targets.map(x => x);
    }
    updateTargets(pts) {
        this.targets = pts;
    }
    enforce() {
        const influence = this.influence;
        const points = [...this.getPoints()];
        for (let i = 0; i < points.length && i < this.targets.length; i++) {
            points[i] = points[i].lerp(influence, this.targets[i]);
        }
        this.setPoints(points);
    }
    onEnable() {
        this.targets = this.getPoints();
    }
}
class MinLengthConstraint extends Constraint {
    constructor(entity) {
        super(entity);
        this.enabled = true;
        this.tension = 1;
        this.node = entity.only(PhysEdge);
    }
    get springConstant() {
        return this.tension * 3;
    }
    enforce() {
        var _a;
        if ((_a = this.entity.maybe(LengthConstraint)) === null || _a === void 0 ? void 0 : _a.enabled) {
            // only apply this constraint in the absense of another length constraint.
            return;
        }
        const length = App.project.modelUnit.from({ value: 3, unit: 'inch' }).value;
        const edge = this.node.edge;
        const delta = Distance(length, 'model').minus(edge.length);
        if (delta.sign < 0) {
            return;
        }
        const correction = edge.tangent.scale(delta.scale(this.springConstant / 2));
        this.node.addForces({
            src: correction.neg(),
            dst: correction,
        });
    }
}
class LengthConstraint extends Constraint {
    constructor(entity, node) {
        super(entity);
        this.targetLength = Refs.of(0);
        this.enabled = false;
        this.node = node || this.entity.only(PhysEdge);
        this.targetLength.onChange(_ => {
            if (this.enabled)
                App.project.requestSave('target length changed');
        });
        this.entity.add(Form, () => {
            const form = new AutoForm();
            const lockField = form.add({
                name: 'lock length',
                kind: 'toggle',
                value: this.enabledRef,
                icons: {
                    on: Icons.lengthLocked,
                    off: Icons.lengthUnlocked,
                },
            });
            const lengthField = form.add({
                name: 'length',
                label: 'length',
                kind: 'amount',
                hidden: Refs.negate(this.enabledRef),
                value: this.targetLength.map({
                    to: modelLength => App.project.displayUnit.from(App.project.modelUnit.newAmount(modelLength)),
                    from: amount => App.project.modelUnit.from(amount).value,
                    compareValues: (a, b) => a.value === b.value && a.unit === b.unit,
                }),
                min: App.project.modelUnit.newAmount(0),
                unit: Units.distance,
            });
            const hardnessField = form.add({
                name: 'length tension',
                label: 'tension',
                kind: 'slider',
                hidden: Refs.negate(this.enabledRef),
                value: this.tensionRef,
                min: 0,
                max: 1,
            });
            return form;
        });
        this.node.edgeRef.onChange(value => {
            if (!this.enabled) {
                this.targetLength.set(value.length.get('model'));
            }
        });
        this._label = Refs.memo(Refs.reduceRo(a => a, App.project.modelUnitRef, App.project.displayUnitRef, this.enabledRef, this.targetLength, this.node.edgeRef.map(e => e.length.get('model'))), (args) => LengthConstraint.generateLabel(...args));
    }
    get label() {
        return this._label.get();
    }
    get length() {
        return this.targetLength.get();
    }
    set length(v) {
        this.targetLength.set(v);
    }
    get springConstant() {
        return this.tension * 3;
    }
    enforce() {
        const node = this.node;
        const delta = Distance(this.length, 'model').minus(node.edge.length);
        const correction = node.edge.tangent.scale(delta.scale(this.springConstant / 2));
        node.addForces({
            src: correction.neg(),
            dst: correction,
        });
    }
    onEnable() {
        this.length = this.node.edge.length.get('model');
    }
    toJson() {
        return {
            factory: this.constructor.name,
            arguments: [
                this.enabled,
                MoreJson.distance.to(Distance(this.length, 'model'))
            ],
        };
    }
    static generateLabel(modelUnit, displayUnit, enabled, targetLength, currentLength) {
        const error = enabled ? currentLength - targetLength : 0;
        const decimals = App.project.displayDecimals;
        const dispLength = displayUnit.from(modelUnit.newAmount(currentLength));
        const dispError = modelUnit.newAmount(error);
        dispError.value = Math.round(dispError.value);
        const hasError = Math.abs(dispError.value) > 0;
        const lengthText = displayUnit.format(dispLength, decimals);
        const errorTextU = displayUnit.format(dispError, decimals);
        const errorText = dispError.value >= 0 ? `+${errorTextU}` : errorTextU;
        const text = hasError ? `${lengthText} (${errorText})` : lengthText;
        return {
            text,
            status: signToErrorStatus(Math.sign(dispError.value)),
        };
    }
}
ComponentFactories.register(LengthConstraint, (entity, enabled, length) => {
    if (!entity.has(PhysEdge))
        return 'not ready';
    const constraint = entity.getOrCreate(LengthConstraint);
    constraint.enabled = enabled;
    constraint.length = MoreJson.distance.from(length).get('model');
    return constraint;
});
class AngleConstraint extends Constraint {
    constructor(entity, center, left, right) {
        super(entity);
        this.center = center;
        this.left = left;
        this.right = right;
        this.targetAngleRef = Refs.of(Angle(Radians(Math.PI / 2), 'model'));
        this.targetAngleRef.onChange(_ => {
            if (this.enabled)
                App.project.requestSave('target angle changed');
        });
        this.corner = Refs.memo(Refs.reduceRo(a => a, center.position, Refs.flatMapRo(left, n => n.position), Refs.flatMapRo(right, n => n.position)), ([center, left, right]) => ({
            center,
            left: Vectors.between(center, left),
            right: Vectors.between(center, right),
        }));
        this.currentAngleRef = Refs.memo(this.corner, ({ center, left, right }) => {
            if (!left.mag2().nonzero || !right.mag2().nonzero) {
                return Angles.zero('model');
            }
            return left.angle().minus(right.angle()).normalize();
        });
        this.entity.add(Form, () => {
            const form = new AutoForm();
            const lockField = form.add({
                name: 'lock angle',
                kind: 'toggle',
                value: this.enabledRef,
                icons: {
                    on: Icons.angleLocked,
                    off: Icons.angleUnlocked,
                },
            });
            const angleField = form.add({
                name: 'angle',
                label: 'angle',
                kind: 'angle',
                hidden: Refs.negate(this.enabledRef),
                value: this.targetAngleRef,
            });
            const tensionField = form.add({
                name: 'angle tension',
                label: 'tension',
                kind: 'slider',
                hidden: Refs.negate(this.enabledRef),
                value: this.tensionRef,
                min: 0,
                max: 1,
            });
            return form;
        });
        this.currentAngleRef.onChange(value => {
            if (!this.enabled) {
                this.targetAngle = value;
            }
        });
        this._label = Refs.memo(Refs.reduceRo(a => a, this.enabledRef, this.currentAngleRef, this.targetAngleRef), (args) => AngleConstraint.generateLabel(...args));
    }
    get label() {
        return this._label.get();
    }
    getCorner() {
        return this.corner.get();
    }
    get targetAngle() {
        return this.targetAngleRef.get();
    }
    set targetAngle(a) {
        this.targetAngleRef.set(a);
    }
    get currentAngle() {
        return this.currentAngleRef.get();
    }
    get springConstant() {
        return this.tension * 3;
    }
    enforce() {
        const { center, left, right } = this.getCorner();
        if (!left.mag2().nonzero || !right.mag2().nonzero) {
            return;
        }
        const currentAngle = this.currentAngle;
        const delta = this.targetAngle.normalize().minus(currentAngle);
        const targetLeft = center.plus(left.rotate(delta.scale(this.springConstant / 2)));
        const targetRight = center.plus(right.rotate(delta.scale(-this.springConstant / 2)));
        const deltaL = Vectors.between(center.plus(left), targetLeft);
        const deltaR = Vectors.between(center.plus(right), targetRight);
        this.left.get().addForce(deltaL.scale(this.tension));
        this.right.get().addForce(deltaR.scale(this.tension));
        if (!App.debug)
            return;
        App.canvas.lineWidth = 1;
        App.canvas.strokeStyle = 'green';
        App.canvas.strokeLine(center, targetLeft);
        App.canvas.strokeStyle = 'blue';
        App.canvas.setLineDash([2, 2]);
        App.canvas.arrow(center.plus(left), targetLeft);
        App.canvas.stroke();
        App.canvas.setLineDash([]);
        App.canvas.strokeStyle = 'red';
        App.canvas.strokeLine(center, targetRight);
        App.canvas.strokeStyle = 'blue';
        App.canvas.setLineDash([2, 2]);
        App.canvas.arrow(center.plus(right), targetRight);
        App.canvas.stroke();
        App.canvas.setLineDash([]);
    }
    onEnable() {
        this.targetAngle = this.currentAngle;
    }
    static generateLabel(enabled, currentAngle, targetAngle) {
        const angle = Degrees(Math.round(unwrap(toDegrees(currentAngle.get('model')))));
        const error = Spaces.getCalc('model', (current, target) => {
            if (!enabled)
                return Degrees(0);
            const delta = Radians(unwrap(current) - unwrap(target));
            return Degrees(Math.round(unwrap(toDegrees(delta))));
        }, currentAngle, targetAngle);
        let label = formatDegrees(angle);
        if (unwrap(error) > 0) {
            label = `${label} (+${formatDegrees(error)})`;
        }
        else if (unwrap(error) < 0) {
            label = `${label} (${formatDegrees(error)})`;
        }
        return {
            text: label,
            status: signToErrorStatus(Math.sign(unwrap(error))),
        };
    }
}
class AxisConstraint extends Constraint {
    constructor(entity) {
        super(entity);
        this.axis = Refs.of(Vector(Axis.X, 'screen'), (one, two) => {
            const a = one.get('screen');
            const b = two.get('screen');
            return a.minus(b).mag() < 0.001;
        });
        this.axisToggle = this.axis.map({
            to: (axis) => Math.abs(axis.get('screen').x) < Math.abs(axis.get('screen').y),
            from: (vertical) => vertical ? Vector(Axis.Y, 'screen') : Vector(Axis.X, 'screen'),
        });
        this.node = entity.only(PhysEdge);
        this._forces = Refs.memo(Refs.reduceRo(a => a, this.axis, this.node.edgeRef, this.tensionRef, App.viewport.changedRef), ([axis, edge, tension, _]) => AxisConstraint.calculateForces(axis.to('model').unit(), edge, tension));
        this.axis.onChange(_ => {
            if (this.enabled)
                App.project.requestSave('axis constraint changed');
        });
        this.entity.add(Form, () => {
            const form = new AutoForm();
            form.add({
                name: 'lock axis',
                kind: 'toggle',
                value: this.enabledRef,
                icons: {
                    on: Icons.axisLocked,
                    off: Icons.axisUnlocked,
                },
            });
            form.add({
                name: 'axis',
                kind: 'toggle',
                value: this.axisToggle,
                hidden: Refs.negate(this.enabledRef),
                icons: { on: Icons.axisY, off: Icons.axisX },
            });
            form.add({
                name: 'axis tension',
                label: 'axis tension',
                kind: 'slider',
                min: 0,
                max: 1,
                value: this.tensionRef,
                hidden: Refs.negate(this.enabledRef),
            });
            return form;
        });
    }
    onEnable() {
        for (const phys of this.entity.get(PhysEdge)) {
            const tangent = phys.edge.tangent;
            const x = Vector(Axis.X, 'screen').to(tangent.space);
            const y = Vector(Axis.Y, 'screen').to(tangent.space);
            this.axis.set(tangent.dot(x).abs().gt(tangent.dot(y).abs()) ? x : y);
        }
    }
    enforce() {
        this.node.addForces(this._forces.get());
    }
    static calculateForces(axis, edge, tension) {
        const tangent = edge.tangent;
        const normal = edge.normal;
        const center = edge.midpoint;
        const length = edge.length.scale(0.5);
        const flip = axis.dot(tangent) > axis.neg().dot(tangent) ? 1 : -1;
        const targetSrc = center.splus(length, axis.scale(-flip));
        const targetDst = center.splus(length, axis.scale(flip));
        const deltaSrc = Vectors.between(edge.src, targetSrc);
        const deltaDst = Vectors.between(edge.dst, targetDst);
        // now enforce the deltas to be normal to the current position
        // so we hopefully rotate with out changing size, all else equal.
        const normDeltaSrc = deltaSrc.onAxis(normal).unit().scale(deltaSrc.mag());
        const normDeltaDst = deltaDst.onAxis(normal).unit().scale(deltaDst.mag());
        const k = 3 * tension; // spring constant
        return {
            src: normDeltaSrc.scale(k / 2),
            dst: normDeltaDst.scale(k / 2),
        };
    }
}
const ConstraintEnforcer = (ecs) => {
    const constraints = ecs.getComponents(Constraint);
    // sort ascending so that higher priority constraints
    // have the last say in the next frame's configuration.
    constraints.sort((a, b) => a.priority - b.priority);
    for (const c of constraints) {
        if (!c.enabled)
            continue;
        if (c.kinematic && (!App.settings.kinematics.get() || App.ui.dragging)) {
            continue;
        }
        c.enforce();
    }
};
"use strict";
var _a, _b;
class Room extends Component {
    constructor(entity) {
        super(entity);
        this[_a] = true;
        this._wallSet = new Set();
        this._walls = [];
        this._triangulation = [];
        this._triangulatedAt = 0;
        this._triangulatedWith = [];
        this.relativeLabelPos = Refs.of(Vectors.zero('model'), (a, b) => Distances.between(a.toPosition(), b.toPosition()).get('model') < 0.001);
        const handle = entity.add(Handle, {
            getPos: () => this.labelPos,
            distance: p => Distances.between(this.labelPos, p)
                .minus(Distance(20, 'screen')),
            selectable: false,
            hoverable: false,
            clickable: true,
            draggable: true,
            drag: () => ({
                kind: 'point',
                get: () => this.labelPos,
                set: p => { this.labelPos = p; },
                name: this.name,
                disableWhenMultiple: true,
            }),
        });
        handle.events.onMouse('click', e => {
            Popup.input({
                title: 'Room Name',
                text: this.nameRef,
                position: App.ui.mousePos,
            });
        });
        this._polygon = Memo(() => {
            const loop = this.loop;
            if (loop.length < 3)
                return null;
            return Refs.memo(Refs.reduceRo(a => a, ...loop.map(w => Refs.flatMapRo(w.srcRef, s => s.position))), (points) => {
                return new Polygon(points);
            });
        }, () => this.loop);
        this._inverted = Memo(() => this.calcInverted(this.polygon), () => [this.polygon]);
    }
    get labelPos() {
        return this.centroid.plus(this.labelOffset);
    }
    set labelPos(pos) {
        const poly = this.polygon;
        const centroid = this.centroid;
        const radius = poly
            ? poly.vertices.map(v => Distances.between(centroid, v))
                .reduce((a, b) => a.max(b), Distance(0, 'model'))
            : Distance(0, 'model');
        const delta = Vectors.between(this.centroid, pos);
        this.labelOffset = delta.mag().gt(radius) ? delta.unit().scale(radius) : delta;
    }
    get labelOffset() {
        return this.relativeLabelPos.get();
    }
    set labelOffset(v) {
        this.relativeLabelPos.set(v);
    }
    get isInverted() {
        return this._inverted();
    }
    calcInverted(poly) {
        if (poly === null || poly.isDegenerate)
            return false;
        const vertices = poly.vertices;
        let inversity = 0;
        for (let i = 0; i < vertices.length; i++) {
            const a = vertices[i];
            const b = vertices[(i + 1) % vertices.length];
            const c = vertices[(i + 2) % vertices.length];
            const ab = Vectors.between(a, b);
            const bc = Vectors.between(b, c);
            inversity += ab.r90().dot(bc).sign > 0 ? 1 : -1;
        }
        return inversity > 0;
    }
    get walls() {
        return this._walls.map(x => x);
    }
    addWall(wall) {
        if (!this._wallSet.has(wall)) {
            this._walls.push(wall);
            this._wallSet.add(wall);
        }
        wall.room = this;
    }
    removeWall(wall) {
        if (this._wallSet.has(wall)) {
            this._wallSet.delete(wall);
            this._walls = this._walls.filter(w => w.name !== wall.name);
        }
        if (wall.room === this) {
            wall.room = null;
        }
        if (this._walls.length === 0) {
            this.entity.destroy();
        }
    }
    containsPoint(point) {
        var _c;
        return !!((_c = this.polygon) === null || _c === void 0 ? void 0 : _c.contains(point));
    }
    get area() {
        const poly = this.polygon;
        if (!poly)
            return Distance(0, 'model');
        return poly.area;
    }
    get triangulation() {
        this.checkTriangulation();
        return [...this._triangulation];
    }
    get polygon() {
        const poly = this._polygon();
        if (poly === null)
            return null;
        return poly.get();
    }
    get loop() {
        const walls = this._walls;
        if (walls.length === 0) {
            return [];
        }
        return walls[0].getConnectedLoop();
    }
    get centroid() {
        var _c;
        return ((_c = this.polygon) === null || _c === void 0 ? void 0 : _c.centroid) || Position(Point.ZERO, 'model');
    }
    checkTriangulation() {
        const poly = this.polygon;
        if (poly === null) {
            this._triangulation = [];
            return;
        }
        if (this._triangulatedAt + Room.TRIANGULATION_FREQUENCY > Time.now) {
            return;
        }
        this._triangulatedAt = Time.now;
        const eps = Distance(1, 'screen');
        const verts = poly.vertices;
        if (verts.length === this._triangulatedWith.length
            && verts.every((v, i) => Distances.between(v, this._triangulatedWith[i]).lt(eps))) {
            return; // nothing to do
        }
        this._triangulation = Triangle.triangulate(poly);
        this._triangulatedWith = verts;
    }
    toJson() {
        return {
            factory: this.constructor.name,
            arguments: [
                {
                    walls: this.walls.map(w => w.entity.id),
                    labelOffset: MoreJson.vector.to(this.labelOffset),
                },
            ],
        };
    }
    tearDown() {
        for (const wall of this.walls) {
            if (wall.room === this) {
                wall.room = null;
                wall.entity.destroy();
            }
        }
    }
}
_a = SOLO;
Room.TRIANGULATION_FREQUENCY = 1.0;
ComponentFactories.register(Room, (entity, data) => {
    const walls = data.walls.map(w => entity.ecs.getEntity(w));
    if (walls.some(w => !(w === null || w === void 0 ? void 0 : w.has(Wall)))) {
        return 'not ready';
    }
    const room = entity.getOrCreate(Room);
    walls.forEach(w => room.addWall(w.only(Wall)));
    if (data.labelOffset) {
        room.labelOffset = MoreJson.vector.from(data.labelOffset);
    }
    return room;
});
class Wall extends Component {
    constructor(entity) {
        super(entity);
        this[_b] = true;
        this._room = null;
        this.srcRef = Refs.of(entity.ecs.createEntity().add(WallJoint), areEq);
        this.dstRef = Refs.of(entity.ecs.createEntity().add(WallJoint), areEq);
        this.src.attachOutgoing(this);
        this.dst.attachIncoming(this);
        const node = entity.add(PhysEdge, Refs.memo(this.srcRef, j => j.entity.only(PhysNode)), Refs.memo(this.dstRef, j => j.entity.only(PhysNode)));
        entity.add(Surfaced, () => entity.ref(e => e.only(PhysEdge)));
        this.edgeRef = Refs.memoReduce((src, dst) => new MemoEdge(src, dst), Refs.flatMapRo(this.srcRef, r => r.position), Refs.flatMapRo(this.dstRef, r => r.position));
        const handle = entity.add(Handle, {
            getPos: () => this.src.pos,
            distance: (pt) => this.edge.distanceFrom(pt),
            priority: 0,
            drag: () => ({
                kind: 'group',
                name: 'endpoints',
                aggregate: 'all',
                items: [
                    this.src.entity.only(Handle).getDragItem(),
                    this.dst.entity.only(Handle).getDragItem(),
                ],
            }),
            onDelete: () => {
                this.elideWall();
                return 'kill';
            },
        });
        const forceFixed = (p) => {
            const f = p.entity.only(FixedConstraint);
            f.updateTargets([p.pos]);
        };
        const lollipopBase = Polygon.lollipop(Position(new Point(10, 0), 'screen'), Position(new Point(40, 0), 'screen'), Distance(10, 'screen'));
        // NB: i don't like that we have to add the fake dependency on the viewport
        // here. the issue is that the conversion between screen and model space is
        // only valid until the view changes, so it doesn't hold for cached values
        // like this.
        const lollipopRef = Refs.memo(Refs.reduceRo(x => x, this.edgeRef, App.viewport.changedRef), ([edge, _]) => {
            return lollipopBase
                .rotate(edge.normal.angle())
                .translate(edge.midpoint.toVector());
        });
        handle.createKnob({
            poly: () => lollipopRef.get(),
            fill: BLUE,
        }, {
            clickable: false,
            selectable: false,
            draggable: true,
            drag: () => {
                var _c, _d;
                const srcpos = this.src.pos;
                const dstpos = this.dst.pos;
                const srctan = (_c = this.src.incoming) === null || _c === void 0 ? void 0 : _c.edge.tangent;
                const dsttan = (_d = this.dst.outgoing) === null || _d === void 0 ? void 0 : _d.edge.tangent;
                return {
                    kind: 'point',
                    name: 'edge',
                    get: () => this.edge.midpoint,
                    set: (midpoint) => {
                        if (typeof srctan !== 'undefined' && typeof dsttan !== 'undefined') {
                            const edge = this.edge;
                            const ray = new SpaceRay(midpoint, edge.tangent);
                            const srchit = ray.intersection(new SpaceRay(srcpos, srctan));
                            const dsthit = ray.intersection(new SpaceRay(dstpos, dsttan));
                            if (srchit === null || dsthit === null) {
                                // shouldn't happen unless the edge is degenerate or smth.
                                return;
                            }
                            this.src.pos = srchit.point;
                            this.dst.pos = dsthit.point;
                        }
                        else {
                            const wing = Vectors.between(srcpos, dstpos).scale(0.5);
                            this.src.pos = midpoint.minus(wing);
                            this.dst.pos = midpoint.plus(wing);
                        }
                        forceFixed(this.src);
                        forceFixed(this.dst);
                    },
                    disableWhenMultiple: true,
                    snapCategories: ['grid', 'guide'],
                };
            },
        });
        entity.add(LengthConstraint);
        entity.add(MinLengthConstraint);
        entity.add(AxisConstraint);
    }
    get srcRo() {
        return Refs.ro(this.srcRef);
    }
    get dstRo() {
        return Refs.ro(this.dstRef);
    }
    get edge() {
        return this.edgeRef.get();
    }
    getConnectedLoop(direction = 'both') {
        const results = [this];
        const seen = new Set(results);
        if (direction === 'backward' || direction === 'both') {
            for (let wall = this.src.incoming; wall !== null && !seen.has(wall); wall = wall.src.incoming) {
                seen.add(wall);
                results.push(wall);
            }
            reverseInPlace(results);
        }
        if (direction === 'forward' || direction === 'both') {
            for (let wall = this.dst.outgoing; wall !== null && !seen.has(wall); wall = wall.dst.outgoing) {
                seen.add(wall);
                results.push(wall);
            }
        }
        return results;
    }
    elideWall() {
        const joints = this.src.ref().and(this.dst.ref()).unwrap();
        if (joints === null)
            return 'kill';
        const [src, dst] = joints;
        const prev = src.incoming;
        const next = dst.outgoing;
        const loop = this.getConnectedLoop('both');
        if (loop.length <= 3) {
            loop.forEach(wall => {
                wall.entity.destroy();
                wall.src.entity.destroy();
                wall.dst.entity.destroy();
            });
            return 'kill';
        }
        if (prev === null || next === null)
            return 'kill';
        const midjoint = this.entity.ecs.createEntity().add(WallJoint);
        midjoint.pos = src.pos.lerp(0.5, dst.pos);
        prev.dst = midjoint;
        next.src = midjoint;
        return 'kill';
    }
    get room() {
        return this._room;
    }
    set room(room) {
        if (room === this._room)
            return;
        const old = this._room;
        this._room = room;
        if (old !== null) {
            old.removeWall(this);
        }
        if (room !== null) {
            room.addWall(this);
        }
    }
    get src() { return this.srcRef.get(); }
    get dst() { return this.dstRef.get(); }
    set src(j) {
        if (j === this.srcRef.get())
            return;
        const old = this.srcRef.get();
        this.srcRef.set(j);
        if (old.outgoing === this) {
            old.detachOutgoing();
        }
        j.attachOutgoing(this);
    }
    set dst(j) {
        if (j === this.dstRef.get())
            return;
        const old = this.dstRef.get();
        this.dstRef.set(j);
        if (old.incoming === this) {
            old.detachIncoming();
        }
        j.attachIncoming(this);
    }
    get outsideNormal() {
        return this.edge.normal;
    }
    get insideNormal() {
        return this.outsideNormal.scale(-1);
    }
    get length() {
        return this.edge.length;
    }
    // split this wall into two walls, creating a new
    // wall joint between them.
    splitWall(at) {
        const edge = new SpaceEdge(this.src.pos, this.dst.pos);
        const s = Vectors.between(edge.src, at).get('model')
            .dot(edge.vector.get('model')) / edge.vector.get('model').mag2();
        if (s >= 1) {
            return null;
        }
        if (s <= 0) {
            // same as above case but on the other side.
            return null;
        }
        const rest = this.entity.ecs.createEntity().add(Wall);
        rest.src.pos = edge.lerp(s);
        rest.dst = this.dst;
        this.dst = rest.src;
        // need to redestribute length constraints, if enabled.
        const length1 = this.entity.only(LengthConstraint);
        if (length1.enabled) {
            const length2 = rest.entity.only(LengthConstraint);
            const total = length1.targetLength.get();
            length1.targetLength.set(total * s);
            length2.targetLength.set(total * (1 - s));
            length2.enabled = true;
            length2.tension = length1.tension;
        }
        length1.entity.only(AxisConstraint).enabled = false;
        if (this.room !== null) {
            this.room.addWall(rest);
        }
        return [this, rest];
    }
    toJson() {
        const lc = this.entity.only(LengthConstraint);
        const ac = this.entity.only(AxisConstraint);
        return {
            factory: this.constructor.name,
            arguments: [
                false,
                ac.enabled ? ac.axisToggle.get() : 0,
            ],
        };
    }
    tearDown() {
        this.src.detachOutgoing();
        this.dst.detachIncoming();
        this.room = null;
    }
}
_b = SOLO;
ComponentFactories.register(Wall, (entity, ignore, axis) => {
    const wall = entity.add(Wall);
    const ac = wall.entity.only(AxisConstraint);
    if (axis !== 0) {
        ac.enabled = true;
        ac.axisToggle.set(axis);
    }
    return wall;
});
class WallJoint extends Component {
    constructor(entity) {
        super(entity);
        this.outRef = Refs.of(null, areEq);
        this.incRef = Refs.of(null, areEq);
        this.node = entity.getOrCreate(PhysNode);
        const handle = entity.add(Handle, {
            getPos: () => this.pos,
            drag: () => ({
                kind: 'point',
                name: this.name,
                get: () => this.pos,
                set: p => {
                    this.pos = p;
                    entity.get(FixedConstraint).forEach(c => c.updateTargets([p]));
                },
            }),
            priority: 2,
            onDelete: () => {
                this.elideJoint();
                return 'kill';
            },
        });
        const leftRef = Refs.of(this.node, areEq);
        const rightRef = Refs.of(this.node, areEq);
        this.outRef.onChange(out => {
            if (out === null) {
                leftRef.set(this.node);
                return;
            }
            leftRef.set(out.dst.node);
            out.dstRef.onChange(dst => {
                if (out === this.outRef.get()) {
                    leftRef.set(dst.node);
                }
            });
        });
        this.incRef.onChange(inc => {
            if (inc === null) {
                rightRef.set(this.node);
                return;
            }
            rightRef.set(inc.src.node);
            inc.srcRef.onChange(src => {
                if (inc === this.incRef.get()) {
                    rightRef.set(src.node);
                }
            });
        });
        entity.add(AngleConstraint, this.node, Refs.ro(leftRef), Refs.ro(rightRef));
        entity.add(FixedConstraint, () => [this.pos], ([p]) => { this.pos = p; });
    }
    get incRo() {
        return Refs.ro(this.incRef);
    }
    get outRo() {
        return Refs.ro(this.outRef);
    }
    shallowDup() {
        // create a wall joint in the same place,
        // but with no connectivity info
        const joint = this.entity.ecs.createEntity().add(WallJoint);
        joint.pos = this.pos;
        return joint;
    }
    elideJoint() {
        // remove this joint from the wall by attempting to join the neighboring walls together.
        const incoming = this.incoming;
        const outgoing = this.outgoing;
        if (incoming === null || outgoing === null)
            return;
        if (!incoming.entity.isAlive || !outgoing.entity.isAlive)
            return;
        this.incRef.set(null);
        this.outRef.set(null);
        if (incoming.src.incoming === outgoing.dst.outgoing) {
            // oops, we'll end up with less than three walls! best scrap the whole thing.
            const seen = new Set();
            for (let joint = this; joint != null && !seen.has(joint); joint = outgoing === null || outgoing === void 0 ? void 0 : outgoing.dst) {
                joint.entity.destroy();
                seen.add(joint);
            }
            for (let joint = this; joint != null && !seen.has(joint); joint = incoming === null || incoming === void 0 ? void 0 : incoming.src) {
                joint.entity.destroy();
                seen.add(joint);
            }
            this.entity.destroy();
            return;
        }
        const next = outgoing.dst;
        outgoing.dst = outgoing.dst.shallowDup();
        outgoing.src = outgoing.src.shallowDup();
        outgoing.dst.entity.destroy();
        outgoing.src.entity.destroy();
        outgoing.entity.destroy();
        incoming.dst = next;
        incoming.dst.entity.get(AngleConstraint).forEach(a => a.enabled = false);
        incoming.entity.get(LengthConstraint).forEach(a => a.enabled = false);
        this.entity.destroy();
    }
    get pos() {
        return this.node.pos;
    }
    set pos(p) {
        this.node.pos = p;
    }
    get position() {
        return this.node.position;
    }
    get isCorner() {
        return this.incoming !== null && this.outgoing !== null;
    }
    get incoming() {
        return this.incRef.get();
    }
    get outgoing() {
        return this.outRef.get();
    }
    attachIncoming(wall) {
        this.incRef.set(wall);
    }
    attachOutgoing(wall) {
        this.outRef.set(wall);
    }
    detachIncoming() {
        const incoming = this.incoming;
        const outgoing = this.outgoing;
        if ((incoming === null || incoming === void 0 ? void 0 : incoming.dst) === this) {
            incoming.entity.destroy();
        }
        this.incRef.set(null);
        if (outgoing === null || outgoing.entity.isDestroyed) {
            this.entity.destroy();
        }
    }
    detachOutgoing() {
        const incoming = this.incoming;
        const outgoing = this.outgoing;
        if ((outgoing === null || outgoing === void 0 ? void 0 : outgoing.src) === this) {
            outgoing.entity.destroy();
        }
        this.outRef.set(null);
        if (incoming === null || incoming.entity.isDestroyed) {
            this.entity.destroy();
        }
    }
    toJson() {
        const angleConstraint = this.entity.only(AngleConstraint);
        const fixedConstraint = this.entity.only(FixedConstraint);
        const position = this.pos;
        const incoming = this.incoming;
        const outgoing = this.outgoing;
        return {
            factory: this.constructor.name,
            arguments: [
                incoming === null ? -1 : unwrap(incoming.entity.id),
                outgoing === null ? -1 : unwrap(outgoing.entity.id),
                {
                    angle: angleConstraint.enabled
                        ? MoreJson.angle.to(angleConstraint.targetAngle) : false,
                    fixed: fixedConstraint.enabled,
                    position: MoreJson.position.to(position),
                },
            ],
        };
    }
    tearDown() {
        const out = this.outgoing;
        const inc = this.incoming;
        if (out !== null && out.src === this)
            out.entity.destroy();
        if (inc !== null && inc.dst === this)
            inc.entity.destroy();
        this.outRef.set(null);
        this.incRef.set(null);
    }
}
ComponentFactories.register(WallJoint, (entity, incomingId, outgoingId, options) => {
    var _c, _d;
    const joint = entity.getOrCreate(WallJoint);
    const constraint = joint.entity.only(AngleConstraint);
    if (options.angle !== false) {
        const angle = MoreJson.angle.from(options.angle);
        constraint.enabled = true;
        constraint.targetAngle = angle;
    }
    joint.pos = MoreJson.position.from(options.position);
    joint.entity.only(FixedConstraint).enabled = options.fixed;
    if (unwrap(incomingId) >= 0) {
        const incoming = (_c = entity.ecs.getEntity(incomingId)) === null || _c === void 0 ? void 0 : _c.maybe(Wall);
        if (!incoming)
            return 'not ready';
        incoming.dst = joint;
    }
    if (unwrap(outgoingId) >= 0) {
        const outgoing = (_d = entity.ecs.getEntity(outgoingId)) === null || _d === void 0 ? void 0 : _d.maybe(Wall);
        if (!outgoing)
            return 'not ready';
        outgoing.src = joint;
    }
    return joint;
});
// cleanup broken geometry
const Recycler = (ecs) => {
    for (const wall of ecs.getComponents(Wall)) {
        if (wall.dst.entity.isDestroyed || wall.src.entity.isDestroyed) {
            wall.entity.destroy();
            continue;
        }
        if (!wall.src.incoming || !wall.src.outgoing) {
            wall.entity.destroy();
            continue;
        }
    }
    for (const joint of ecs.getComponents(WallJoint)) {
        const incoming = joint.incoming;
        const outgoing = joint.outgoing;
        if (incoming !== null && incoming.entity.isDestroyed) {
            joint.detachIncoming();
        }
        if (outgoing !== null && outgoing.entity.isDestroyed) {
            joint.detachOutgoing();
        }
    }
};
const AxisConstraintRenderer = (ecs) => {
    var _c;
    if (!App.settings.showGuides.get())
        return;
    const canvas = App.canvas;
    const constraints = ecs.getComponents(AxisConstraint);
    for (const constraint of constraints) {
        if (!constraint.enabled)
            continue;
        const edge = (_c = constraint.entity.maybe(PhysEdge)) === null || _c === void 0 ? void 0 : _c.edge;
        if (!edge) {
            continue;
        }
        const center = edge.midpoint;
        const axis = constraint.axis.get().to(center.space).unit();
        const scale = 1.5;
        const left = center.splus(edge.length.scale(scale / 2), axis);
        const right = center.splus(edge.length.scale(scale / 2), axis.neg());
        canvas.strokeStyle = BLUE;
        canvas.lineWidth = 1;
        canvas.setLineDash([8, 4]);
        canvas.strokeLine(left, right);
        canvas.setLineDash([]);
    }
};
const createRainbow = (edge) => {
    const gradient = App.canvas.createLinearGradient(edge.src, edge.dst);
    new Array(100).fill(0).forEach((_, i, arr) => {
        const s = 1.0 * i / (arr.length - 1);
        const hue = ((360 * s * 10) + (Time.now * 100.)) % 360;
        gradient.addColorStop(s, `hsl(${hue},100%,50%)`);
    });
    return gradient;
};
const WallRendererState = {
    cache: new Map(),
};
const WallRenderer = (ecs) => {
    const canvas = App.canvas;
    const rainbow = createRainbow(new SpaceEdge(Position(Point.ZERO, 'screen'), Position(new Point(canvas.width, canvas.height), 'screen')));
    const walls = ecs.getComponents(Wall);
    for (const wall of walls) {
        if (wall.src === null || wall.dst === null)
            continue;
        const cached = (f, name, ...id) => {
            const key = `${wall.id}.${name}.${id.map(e => `${e}`).join(':')}`;
            if (WallRendererState.cache.has(key)) {
                const cf = WallRendererState.cache.get(key);
                return cf();
            }
            WallRendererState.cache.set(key, f);
            return f();
        };
        const active = wall.entity.get(Handle).some(h => h.isActive);
        const edge = wall.edge;
        const normal = edge.normal;
        const tangent = edge.tangent;
        const length = edge.length;
        const wallColor = active ? rainbow : 'black';
        const getEndPad = (joint, offset) => {
            // nb: at offset = 0, this will always be 0
            const angle = joint.entity.only(AngleConstraint).currentAngle;
            const radians = unwrap(angle.get('model'));
            return offset.scale(Math.sin(radians)).neg();
        };
        const strokeWall = (width, offset = Distances.zero('screen'), color = wallColor) => {
            const { src, dst } = cached(Memo(() => {
                const edge = wall.edge;
                const srcpad = getEndPad(wall.src, offset);
                const dstpad = getEndPad(wall.dst, offset);
                const normal = wall.edge.normal;
                const tangent = wall.edge.tangent;
                const src = edge.src
                    .splus(offset, normal)
                    .splus(srcpad, tangent);
                const dst = edge.dst
                    .splus(offset, normal)
                    .splus(dstpad, tangent.neg());
                return { src, dst };
            }, () => [wall.src.pos.to('screen').toString(), wall.dst.pos.to('screen').toString()]), 'strokeWall', width, offset);
            canvas.strokeStyle = color;
            canvas.lineWidth = width;
            canvas.strokeLine(src, dst);
            canvas.fillStyle = color;
            canvas.fillCircle(src, Distance(width / 2, 'screen'));
            canvas.fillCircle(dst, Distance(width / 2, 'screen'));
        };
        const thickness = Distance(6, 'screen');
        strokeWall(3, thickness.scale(0.5));
        strokeWall(1, thickness.scale(-0.5));
        if (!App.settings.showLengths.get())
            continue;
        const constraint = wall.entity.only(LengthConstraint);
        const label = constraint.label;
        const textOffset = Distance(App.settings.fontSize / 2 + 10, 'screen');
        const textPosition = edge.midpoint.splus(textOffset.neg(), normal);
        if (constraint.enabled) {
            const offCenter = Distance(App.settings.fontSize * 3, 'screen');
            const maxAccentWidth = length.scale(0.5).minus(offCenter.scale(1.5));
            const accentWidth = Distance(50, 'screen').min(maxAccentWidth);
            if (accentWidth.sign > 0) {
                canvas.strokeStyle = 'black';
                canvas.lineWidth = 1;
                canvas.strokeLine(textPosition.splus(offCenter, tangent), textPosition.splus(offCenter.plus(accentWidth), tangent));
                canvas.strokeLine(textPosition.splus(offCenter, tangent.neg()), textPosition.splus(offCenter.plus(accentWidth), tangent.neg()));
            }
        }
        const shadowMap = {
            'satisfied': undefined,
            'over': PINK,
            'under': BLUE,
        };
        canvas.text({
            point: textPosition,
            axis: tangent,
            keepUpright: true,
            text: label.text,
            fill: 'black',
            shadow: shadowMap[label.status],
            align: 'center',
            baseline: 'middle',
        });
        if (App.debug) {
            canvas.text({
                point: textPosition.splus(Distance(-15, 'screen'), normal),
                axis: tangent,
                keepUpright: true,
                text: wall.name,
                fill: 'black',
                align: 'center',
                baseline: 'middle',
            });
        }
    }
};
const WallJointRenderer = (ecs) => {
    if (App.rendering.get())
        return;
    const joints = ecs.getComponents(WallJoint);
    const canvas = App.canvas;
    for (const joint of joints) {
        const active = joint.entity.get(Handle).some(h => h.isActive);
        const locked = joint.entity.get(FixedConstraint).some(f => f.enabled);
        if (App.tools.current.name !== 'joint tool'
            && !App.settings.showJoints.get()
            && !active) {
            continue;
        }
        canvas.fillStyle = 'black';
        canvas.strokeStyle = 'black';
        canvas.lineWidth = 1;
        const pos = joint.pos;
        const radius = Distance(5, 'screen');
        if (active) {
            canvas.fillStyle = 'white';
            canvas.strokeStyle = PINK;
            canvas.lineWidth = 4;
        }
        else if (locked) {
            canvas.fillStyle = 'black';
        }
        else {
            canvas.fillStyle = 'white';
        }
        canvas.fillCircle(pos, radius);
        canvas.strokeCircle(pos, radius);
        canvas.lineWidth = 1;
    }
};
const RoomRenderer = (ecs) => {
    ecs.getComponents(Room).forEach(room => {
        if (!room.isInverted) {
            const labelPos = room.labelPos;
            App.canvas.text({
                text: room.isInverted ? 'interior wall' : room.name,
                point: labelPos,
                fill: 'black',
                align: 'center',
                baseline: 'middle',
            });
            const area = room.area;
            if (area.nonzero) {
                const sqrtModel = App.project.modelUnit.newAmount(Math.sqrt(area.get('model')));
                const sqrtDisplay = App.project.displayUnit.from(sqrtModel);
                const amount = App.project.displayUnit.newAmount(Math.pow(sqrtDisplay.value, 2));
                const num = prettyNum(roundBy(amount.value, App.project.displayDecimals));
                const label = `${num} ${amount.unit}²`;
                App.canvas.text({
                    text: label,
                    point: labelPos.splus(App.settings.fontSize * 2, Vector(Axis.Y, 'screen')),
                    fill: 'darkgray',
                    align: 'center',
                    baseline: 'middle',
                });
            }
        }
        if (App.debug) {
            const triangles = room.triangulation;
            let count = 0;
            for (const tri of triangles) {
                const smol = tri.scale(0.9);
                App.canvas.polygon(smol);
                App.canvas.strokeStyle = `hsl(${Math.round(330 * count / triangles.length)}, 100%, 50%)`;
                App.canvas.lineWidth = 1;
                App.canvas.setLineDash([]);
                App.canvas.stroke();
                App.canvas.strokeCircle(smol.b, Distance(5, 'screen'));
                count++;
            }
        }
    });
};
const AngleRenderer = (ecs) => {
    var _c;
    if (!App.settings.showAngles.get())
        return;
    const constraints = ecs.getComponents(AngleConstraint);
    const canvas = App.canvas;
    for (const constraint of constraints) {
        const { center, left, right } = constraint.getCorner();
        if (!left.mag2().nonzero || !right.mag2().nonzero) {
            continue;
        }
        const leftAngle = left.angle();
        const rightAngle = right.angle();
        const arcRadius = Distance(15, 'screen');
        const textDistance = arcRadius.map(r => r + 20);
        const middle = right.rotate(constraint.currentAngle.scale(0.5)).to('model').unit();
        if ((_c = constraint.entity.maybe(FixedConstraint)) === null || _c === void 0 ? void 0 : _c.enabled) {
            const icon = IconImages.lockSmall;
            const size = Distance(8, 'screen');
            canvas.image(icon, center
                .splus(Distance(-15, 'screen'), middle)
                .splus(size.div(-1.25), Vector(Axis.X, 'screen'))
                .splus(size.div(-1.25), Vector(Axis.Y, 'screen')), size, size);
        }
        const color = (opaque) => {
            if (constraint.enabled) {
                return `hsla(0, 0%, 0%, ${opaque ? 1 : 0.75})`;
            }
            return `hsla(0, 0%, 50%, ${opaque ? 1 : 0.25})`;
        };
        const label = constraint.label;
        const shadowMap = {
            over: PINK,
            under: BLUE,
        };
        canvas.text({
            text: label.text,
            align: 'center',
            baseline: 'middle',
            point: center.splus(textDistance, middle),
            fill: color(true),
            shadow: shadowMap[label.status],
        });
        const arc = (arcRadius, fill, stroke) => {
            canvas.beginPath();
            canvas.moveTo(center.splus(arcRadius, right.unit()));
            canvas.arc(center, arcRadius, rightAngle, leftAngle, true);
            if (stroke) {
                canvas.strokeStyle = stroke;
                canvas.stroke();
            }
            if (fill) {
                canvas.lineTo(center);
                canvas.closePath();
                canvas.fillStyle = fill;
                canvas.fill();
            }
        };
        const active = constraint.entity.has(Selected) || constraint.entity.has(Hovered)
            || constraint.entity.has(Dragging);
        if (!active) {
            canvas.lineWidth = 1;
            arc(arcRadius, color(false), color(false));
        }
        else {
            const thickness = 4;
            canvas.lineWidth = thickness;
            arc(arcRadius, 'white', null);
            arc(arcRadius.minus(Distance(thickness / 2, 'screen')), null, PINK);
            arc(arcRadius.plus(Distance(thickness / 2, 'screen')), null, BLUE);
        }
    }
};
"use strict";
class Popup extends Component {
    constructor(entity) {
        super(entity);
        this.visible = false;
        this.anchor = {
            position: Position(Point.ZERO, 'screen'),
            halign: 'center',
            valign: 'middle',
            onCanvas: false,
        };
        this.closeOnUnfocus = true;
        this.element = document.createElement('div');
        this.element.setAttribute('class', 'popup');
        this._uiBuilder = new UiBuilder(this.element);
        this.addKind(Popup);
    }
    getUiBuilder() {
        return this._uiBuilder;
    }
    get isVisible() {
        return this.visible;
    }
    setPosition(pos) {
        this.setAnchor({
            position: pos,
            onCanvas: true,
            halign: 'center',
            valign: 'middle',
        });
    }
    setAnchor(anchor) {
        this.anchor = anchor;
        this.moveToAnchor();
    }
    show() {
        if (this.visible)
            return;
        this.visible = true;
        document.body.appendChild(this.element);
        this.moveToAnchor();
    }
    hide() {
        if (!this.visible)
            return;
        this.visible = false;
        document.body.removeChild(this.element);
    }
    tearDown() {
        this.hide();
    }
    moveToAnchor() {
        const { position, onCanvas, halign, valign } = this.anchor;
        const pos = position.get('screen');
        const canvas = App.pane.getBoundingClientRect();
        const bounds = this.element.getBoundingClientRect();
        const width = bounds.width;
        const height = bounds.height;
        let tx = pos.x;
        let ty = pos.y;
        if (halign === 'center') {
            tx -= width / 2;
        }
        else if (halign === 'right') {
            tx -= width;
        }
        if (valign === 'middle') {
            ty -= height / 2;
        }
        else if (valign === 'bottom') {
            ty -= height;
        }
        if (onCanvas) {
            tx += canvas.left;
            ty += canvas.top;
        }
        this.element.style.left = `${tx}px`;
        this.element.style.top = `${ty}px`;
    }
    static input(props) {
        const modal = App.ecs.createEntity().add(props.decorations === 'window' ? PopupWindow : Popup);
        if (props.decorations === 'window') {
            modal.title = props.title;
        }
        const ui = modal.getUiBuilder();
        if (props.body) {
            ui.addText(props.body).newRow();
        }
        ui.addInput('text', 'text', {});
        ui.setValue('text', props.text.get());
        ui.onChange((name, value) => {
            if (name === 'text') {
                props.text.set(value);
            }
            modal.entity.destroy();
        });
        modal.setPosition(props.position || Position(new Point(App.viewport.screen_width / 2, App.viewport.screen_height / 2), 'screen'));
        modal.show();
        setTimeout(() => ui.focus(), 100);
    }
    static confirm(props) {
        const confirm = App.ecs.createEntity().add(PopupWindow);
        confirm.title = props.title;
        confirm.getUiBuilder()
            .addText(props.body)
            .newRow()
            .addButton(props.cancelLabel || 'Cancel', _ => confirm.entity.destroy())
            .addButton(props.okLabel || '<b>Okay</b>', _ => {
            confirm.entity.destroy();
            props.action();
        });
        confirm.setPosition(props.position || Position(new Point(App.viewport.screen_width / 2, App.viewport.screen_height / 2), 'screen'));
        confirm.show();
    }
}
class PopupWindow extends Popup {
    constructor(entity) {
        super(entity);
        this.element.setAttribute('class', 'popup window');
        const header = document.createElement('div');
        header.setAttribute('class', 'popup-header');
        this.element.appendChild(header);
        const title = document.createElement('div');
        title.setAttribute('class', 'popup-title');
        header.appendChild(title);
        const close = document.createElement('a');
        close.setAttribute('class', 'btn popup-close');
        close.setAttribute('href', '#');
        close.innerHTML = '×';
        header.appendChild(close);
        const content = document.createElement('div');
        content.setAttribute('class', 'popup-content');
        this.element.appendChild(content);
        this.headerEl = header;
        this.titleEl = title;
        this.contentEl = content;
        this.uiBuilder = new UiBuilder(this.contentEl);
        close.addEventListener('click', () => this.hide());
        this.makeDraggable(this.element, header);
    }
    set title(s) {
        this.titleEl.innerHTML = s;
    }
    getUiBuilder() {
        return this.uiBuilder;
    }
    appendHTML(el) {
        this.contentEl.appendChild(el);
    }
    show() {
        super.show();
        this.uiBuilder.focus();
    }
    makeDraggable(element, handle) {
        const drag = {
            start: Point.ZERO,
            offset: Vec.ZERO,
            dragging: false,
        };
        handle.style.cursor = 'grab';
        handle.addEventListener('mousedown', (e) => {
            const pos = new Point(e.clientX, e.clientY);
            drag.start = pos;
            const rect = element.getBoundingClientRect();
            drag.offset = Vec.between(pos, new Point(rect.left, rect.top));
            drag.dragging = true;
            handle.style.cursor = 'grabbing';
        });
        window.addEventListener('mousemove', (e) => {
            const pos = new Point(e.clientX, e.clientY);
            if (drag.dragging) {
                const tl = pos.plus(drag.offset);
                element.style.left = `${tl.x}px`;
                element.style.top = `${tl.y}px`;
            }
        });
        handle.addEventListener('mouseup', (e) => {
            drag.dragging = false;
            handle.style.cursor = 'grab';
        });
    }
}
class UiBuilder {
    constructor(pane) {
        this.pane = pane;
        this.changeListeners = [];
        this.inputs = new Map();
        this.initialFocus = null;
        this.salt = `uib-${UiBuilder.index++}-`;
        this.row = UiBuilder.createRow();
        this.pane.appendChild(this.row);
    }
    focus() {
        if (this.initialFocus !== null) {
            this.initialFocus.focus();
        }
    }
    fireChange(field) {
        const value = this.getValue(field);
        this.changeListeners.forEach(listener => listener(field, value));
    }
    onChange(listener) {
        this.changeListeners.push(listener);
    }
    add(el) {
        this.row.appendChild(el);
        return this;
    }
    getFields() {
        return new Set(this.inputs.keys());
    }
    getValue(name) {
        return this.inputs.get(name).value();
    }
    setValue(name, value) {
        this.inputs.get(name).set(`${value}`);
    }
    resetField(name) {
        this.inputs.get(name).reset();
    }
    addLabel(label, forField) {
        return this.add(this.create('label', { 'for': forField }, label));
    }
    addText(text) {
        return this.add(this.create('div', {}, text));
    }
    addInput(name, inputType, attrs) {
        const e = this.create('input', Object.assign({ name, id: name, 'type': inputType }, attrs));
        const input = e;
        input.addEventListener('change', () => this.fireChange(name));
        input.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                this.changeListeners.forEach(l => l('Escape', ''));
            }
            if (e.key === 'Enter' || e.key === 'Return') {
                setTimeout(() => this.changeListeners.forEach(l => l('Return', '')), 100);
            }
        });
        this.inputs.set(name, {
            value: () => input.value,
            reset: () => {
                input.value = `${attrs.value || ''}`;
                this.fireChange(name);
            },
            set: (v) => {
                input.value = v;
                this.fireChange(name);
            },
        });
        return this.add(e);
    }
    addFormattedInput(name, reformat, attrs) {
        const input = this.create('input', Object.assign({ name, id: name, 'type': 'text' }, attrs));
        input.addEventListener('change', () => {
            const formatted = reformat(input.value);
            if (input.value !== formatted) {
                input.value = formatted;
            }
            this.fireChange(name);
        });
        this.inputs.set(name, {
            value: () => reformat(input.value),
            reset: () => {
                reformat(`${attrs.value}` || '');
                this.fireChange(name);
            },
            set: (v) => {
                input.value = reformat(v);
                this.fireChange(name);
            },
        });
        return this.add(input);
    }
    addNumberInput(name, attrs) {
        return this.addInput(name, 'number', attrs);
    }
    addDropdown(name, attrs) {
        const select = this.create('select', { name, id: name });
        if (attrs.placeholder) {
            const el = this.create('option', { value: '' }, attrs.placeholder);
            select.appendChild(el);
        }
        for (const option of attrs.options) {
            const el = this.create('option', { value: option.name }, option.label || option.name);
            select.appendChild(el);
        }
        if (typeof attrs.selected !== 'undefined') {
            select.value = attrs.selected;
        }
        select.addEventListener('change', () => this.fireChange(name));
        this.inputs.set(name, {
            value: () => select.value,
            reset: () => {
                select.value = attrs.placeholder ? '' : attrs.options[0].name;
                this.fireChange(name);
            },
            set: (v) => {
                select.value = attrs.placeholder ? '' : attrs.options[0].name;
                this.fireChange(name);
            },
        });
        return this.add(select);
    }
    addSlider(name, attrs) {
        const initial = 10000 * (attrs.initial - attrs.min) / (attrs.max - attrs.min);
        const slider = this.create('input', {
            name,
            id: name,
            'type': 'range',
            min: 0,
            max: 10000,
            value: initial,
        });
        slider.addEventListener('change', () => this.fireChange(name));
        this.inputs.set(name, {
            value: () => {
                const s = parseFloat(slider.value) / 10000.;
                return `${lerp(s, attrs.min, attrs.max)}`;
            },
            reset: () => {
                slider.value = `${initial}`;
                this.fireChange(name);
            },
            set: (v) => {
                const f = 10000 * (parseFloat(v) - attrs.min) / (attrs.max - attrs.min);
                slider.value = `${f}`;
                this.fireChange(name);
            },
        });
        return this.add(slider);
    }
    addCheckbox(name, checked = false) {
        const checkbox = this.create('input', {
            name,
            id: name,
            'type': 'checkbox',
        });
        checkbox.checked = checked;
        checkbox.addEventListener('change', () => this.fireChange(name));
        this.inputs.set(name, {
            value: () => checkbox.checked ? 'true' : 'false',
            reset: () => {
                checkbox.checked = checked;
                this.fireChange(name);
            },
            set: (v) => {
                checkbox.checked = v === 'true';
                this.fireChange(name);
            },
        });
        return this.add(checkbox);
    }
    addRadioGroup(name, options) {
        const group = this.create('div', { 'class': 'radio-group' });
        const radios = new Map();
        for (const option of options) {
            const radio = this.create('input', {
                'type': 'radio',
                id: option.name,
                name: name,
                value: option.value || option.name,
            });
            radios.set(option.name, radio);
            radio.checked = option.isDefault;
            radio.addEventListener('change', () => this.fireChange(name));
            group.appendChild(radio);
            const label = this.create('label', {
                'for': option.name,
            }, option.label || option.name);
            group.appendChild(label);
        }
        this.inputs.set(name, {
            value: () => {
                const checked = Array.from(radios.keys())
                    .filter(r => radios.get(r).checked);
                if (checked.length > 0)
                    return checked[0];
                return options[0].name;
            },
            reset: () => {
                options.forEach(o => {
                    radios.get(o.name).checked = o.isDefault;
                });
            },
            set: (v) => {
                options.forEach(o => {
                    const value = o.value || o.name;
                    radios.get(o.name).checked = value === v;
                });
            },
        });
        return this.add(group);
    }
    addButton(label, action) {
        const button = this.create('button', { value: label }, label);
        button.addEventListener('click', () => action(this));
        return this.add(button);
    }
    addResetButton(label = 'Reset') {
        return this.addButton(label, ui => {
            Array.from(ui.getFields()).forEach(f => ui.resetField(f));
        });
    }
    newRow() {
        this.row = UiBuilder.createRow();
        this.pane.appendChild(this.row);
        return this;
    }
    addSpacer() {
        const e = document.createElement('div');
        e.setAttribute('style', 'flex-grow: 1;');
        return this.add(e);
    }
    create(tagName, atts, innerHTML = '') {
        const element = UiBuilder.createSalted(this.salt, tagName, atts, innerHTML);
        const autofocusTypes = new Set(['text', 'number']);
        if (this.initialFocus === null
            && tagName === 'input'
            && autofocusTypes.has(`${atts['type']}` || '')) {
            this.initialFocus = element;
        }
        return element;
    }
    static createRow() {
        return UiBuilder.createSalted('', 'div', { 'class': 'row' });
    }
    static createSalted(salt, tagName, atts, innerHTML = '') {
        const salty = new Set(['id', 'name', 'for']);
        const e = document.createElement(tagName);
        if (tagName === 'input' && atts['type'] === 'text') {
            e.setAttribute('class', 'textbox');
        }
        for (const key of Object.keys(atts)) {
            let value = `${atts[key]}`;
            if (salty.has(key)) {
                value = `${salt}${value}`;
            }
            e.setAttribute(key, value);
        }
        e.innerHTML = innerHTML;
        return e;
    }
}
UiBuilder.index = 0;
"use strict";
class Project {
    constructor() {
        this.loadedAt = 0;
        this.saveRequestedAt = 0;
        this.historyIndex = 0;
        // defines what 1 unit of model space is
        this.modelUnitRef = Refs.of(Units.distance.get('in'), (a, b) => (a.name === b.name));
        // defines what unit is used to render UI labels.
        this.displayUnitRef = Refs.of(Units.distance.get('ft'), (a, b) => (a.name === b.name));
        this.gridSpacingRef = Refs.of(Project.DEFAULT_GRID_SPACING, (a, b) => (a.unit === b.unit && a.value === b.value));
        this.projectNameRef = Refs.of(Project.DEFAULT_NAME);
    }
    get projectName() {
        const name = this.projectNameRef.get().trim()
            .replace(/[#%&{}\\<>*?/$!'":@+`|=]+/g, '');
        return name.toString();
    }
    set projectName(name) {
        this.projectNameRef.set(name);
    }
    get displayUnit() {
        return this.displayUnitRef.get();
    }
    set displayUnit(unit) {
        this.displayUnitRef.set(unit);
    }
    get gridSpacing() {
        return this.gridSpacingRef.get();
    }
    set gridSpacing(amount) {
        this.gridSpacingRef.set(amount);
    }
    get displayDecimals() {
        return Math.round(Math.log10(1.0 / App.project.displayUnit.from(App.project.gridSpacing).value)) + 1;
    }
    get modelUnit() {
        return this.modelUnitRef.get();
    }
    set modelUnit(unit) {
        const scaleFactor = unit.from(this.modelUnitRef.get().newAmount(1)).value;
        if (scaleFactor === 1.0) {
            this.modelUnitRef.set(unit);
            return; // wow that was easy
        }
        // have to go in and update all the units....
        const nodes = App.ecs.getComponents(PhysNode);
        if (nodes.length === 0) {
            // we got off easy
            this.modelUnitRef.set(unit);
            return;
        }
        // update positions of all physics elements
        const centroid = nodes.map(n => n.pos)
            .map(n => n.get('model').toVec().scale(1.0 / nodes.length))
            .reduce((a, b) => a.plus(b), Point.ZERO);
        for (const node of App.ecs.getComponents(PhysNode)) {
            const p = node.pos.get('model');
            const delta = Vec.between(centroid, p);
            node.pos = Position(centroid.splus(scaleFactor, delta), 'model');
        }
        // update any fixed point constraints
        for (const constraint of App.ecs.getComponents(FixedConstraint)) {
            constraint.updateTargets(constraint.getTargets().map(pos => {
                const v = Vec.between(centroid, pos.get('model'));
                return Position(centroid.splus(scaleFactor, v), 'model');
            }));
        }
        // update any length constraints
        for (const constraint of App.ecs.getComponents(LengthConstraint)) {
            constraint.length *= scaleFactor;
        }
        // rectangles
        for (const rect of App.ecs.getComponents(Rectangular)) {
            rect.width = rect.width.scale(scaleFactor);
            rect.height = rect.height.scale(scaleFactor);
            rect.center = Position(centroid, 'model').splus(scaleFactor, Vectors.between(Position(centroid, 'model'), rect.center));
        }
        this.modelUnitRef.set(unit);
        App.viewport.recenter();
    }
    modelToAmount(value) {
        return new Amount(value, this.modelUnit.name);
    }
    amountToModel(amount) {
        return this.modelUnit.from(amount).value;
    }
    formatDistance(distance) {
        const amount = this.displayUnit.from(this.modelUnit.newAmount(distance.get('model')));
        return this.displayUnit.format(this.displayUnit.newAmount(roundBy(amount.value, this.displayDecimals)));
    }
    newProject() {
        const action = () => {
            App.ecs.deleteEverything();
            this.gridSpacing = Project.DEFAULT_GRID_SPACING;
            App.viewport.recenter();
            this.projectName = Project.DEFAULT_NAME;
            window.localStorage.removeItem(Project.PROJECT_KEY);
        };
        if (App.ecs.getComponents(Wall).length > 0) {
            Popup.confirm({
                title: 'Create New Project',
                body: 'This will clear any unsaved work and open a new project.',
                action,
            });
        }
        else {
            action();
        }
    }
    saveProject() {
        const data = JSON.stringify(this.serialize());
        const dataUrl = `data:application/json;base64,${btoa(data)}`;
        const basename = this.projectName;
        const filename = basename.toLocaleLowerCase().endsWith('.json') ? basename : `${basename}.json`;
        App.io.download(filename, dataUrl);
    }
    openProject() {
        const load = (json) => {
            App.pane.style.opacity = '0';
            this.loadJson(json);
            setTimeout(() => {
                App.pane.style.opacity = '1';
                App.actions.fire('recenter');
                this.saveLocal();
            }, 100);
        };
        App.io.open(['.json'], url => fetch(url).then(response => response.json()).then(load));
    }
    saveLocal() {
        const data = JSON.stringify(this.serialize());
        App.log(`saved ${data.length} bytes to local storage`);
        window.localStorage.setItem(Project.PROJECT_KEY, data);
    }
    loadLocal() {
        const data = window.localStorage.getItem(Project.PROJECT_KEY);
        if (!data)
            return;
        const json = JSON.parse(data);
        this.loadJson(json);
        App.viewport.recenter();
    }
    requestSave(reason) {
        if (App.history.isSuspended)
            return;
        if (this.loadedAt + Project.LOAD_DELAY > Time.now)
            return;
        App.log(`requestSave(${reason})`);
        this.saveRequestedAt = Time.now;
    }
    serialize() {
        return {
            application: 'drawall',
            projectName: this.projectName,
            version: Project.STORAGE_VERSION,
            ecs: App.ecs.toJson(),
            gridSpacing: Units.distance.format(this.gridSpacing),
            modelUnit: this.modelUnit.name,
            displayUnit: this.displayUnit.name,
        };
    }
    loadJson(json) {
        if (!json || json.application !== 'drawall') {
            // TODO: show a dialog to the user?
            console.error('invalid project file', json);
            return;
        }
        this.loadedAt = Time.now;
        App.history.suspendWhile(() => {
            const p = json;
            App.ecs.deleteEverything();
            if (p.gridSpacing) {
                const spacing = Units.distance.parse(p.gridSpacing);
                if (spacing !== null) {
                    this.gridSpacing = spacing;
                }
            }
            if (p.modelUnit) {
                this.modelUnitRef.set(Units.distance.get(p.modelUnit));
            }
            if (p.displayUnit) {
                this.displayUnitRef.set(Units.distance.get(p.displayUnit));
            }
            App.ecs.loadJson(p.ecs);
            this.projectName = p.projectName || Project.DEFAULT_NAME;
        });
        this.loadedAt = Time.now;
    }
    setup() {
        this.modelUnitRef.onChange(_ => this.requestSave('model unit'));
        this.displayUnitRef.onChange(_ => this.requestSave('display unit'));
        this.gridSpacingRef.onChange(_ => this.requestSave('grid spacing'));
        this.projectNameRef.onChange(_ => this.requestSave('project name'));
    }
    update() {
        const saveReq = this.saveRequestedAt;
        if (saveReq !== null
            && Time.now - saveReq >= Project.SAVE_FREQUENCY_SECONDS) {
            this.saveLocal();
            App.history.push();
            this.saveRequestedAt = null;
        }
    }
}
Project.DEFAULT_GRID_SPACING = { value: 2, unit: 'feet' };
Project.DEFAULT_NAME = 'untitled floorplan';
Project.STORAGE_VERSION = '0.0.1';
Project.PROJECT_KEY = 'project-data';
Project.SAVE_FREQUENCY_SECONDS = 0.5;
Project.LOAD_DELAY = 0.5;
"use strict";
class ProjectHistory {
    constructor() {
        this.canUndo = Refs.of(false);
        this.canRedo = Refs.of(false);
        this.history = [];
        this.index = 0;
        this.suspended = 0;
    }
    undo() {
        this.go(clamp(this.index - 1, 0, this.history.length - 1));
    }
    redo() {
        this.go(clamp(this.index + 1, 0, this.history.length - 1));
    }
    push() {
        if (this.isSuspended)
            return;
        this.history = this.history.filter((_, i) => i <= this.index);
        this.history.push(App.project.serialize());
        this.pruneHistory();
        this.index = this.history.length - 1;
        this.updateCans();
        App.log(`history.push(): ${this.index} of ${this.history.length}`);
    }
    suspend() {
        this.suspended++;
    }
    resume() {
        this.suspended--;
    }
    suspendWhile(action) {
        this.suspend();
        try {
            return action();
        }
        finally {
            this.resume();
        }
    }
    get isSuspended() {
        return this.suspended > 0;
    }
    pruneHistory() {
        const prune = Math.max(0, this.history.length - ProjectHistory.MAX_LENGTH);
        this.history = this.history.filter((_, i) => i >= prune);
        this.index -= prune;
    }
    updateCans() {
        this.canUndo.set(this.index <= this.history.length && this.index > 0);
        this.canRedo.set(this.index < this.history.length - 1);
    }
    go(index) {
        App.log(`history(${index}) of ${this.history.length} ${this.isSuspended ? 'suspended' : ''}`);
        return this.suspendWhile(() => {
            if (index < 0 || index >= this.history.length) {
                return false;
            }
            const item = this.history[index];
            App.project.loadJson(item);
            this.index = index;
            this.updateCans();
            return true;
        });
    }
}
ProjectHistory.MAX_LENGTH = 10;
"use strict";
// Settings which aren't specific to the current project,
// and are something more like application settings.
class Settings {
    constructor() {
        this.fontSizeRef = Refs.of(16);
        this.kinematics = Refs.of(true);
        this.showGuides = Refs.of(true);
        this.showAngles = Refs.of(true);
        this.showLengths = Refs.of(true);
        this.showJoints = Refs.of(false);
        this.showGrid = Refs.of(true);
        this.showVisibilityOptions = Refs.of(true);
        // TODO: why is this field here??? should be w the other
        // snap fields in ux.ts
        this.snapGrid = Refs.of(true);
    }
    get fontSize() {
        return this.fontSizeRef.get();
    }
}
"use strict";
class IoUtil {
    download(filename, dataUrl) {
        var _a;
        const download = document.createElement('a');
        download.href = dataUrl.toString();
        download.download = filename;
        App.uiJail.appendChild(download);
        download.click();
        (_a = download.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(download);
    }
    open(extensions, callback) {
        var _a;
        const element = document.createElement('input');
        element.setAttribute('type', 'file');
        element.setAttribute('accept', extensions.join(', '));
        element.style.position = 'absolute';
        element.style.opacity = '0';
        App.uiJail.appendChild(element);
        element.addEventListener('change', () => {
            const files = Array.from(element.files || []);
            for (const file of files) {
                callback(URL.createObjectURL(file));
                break;
            }
        });
        element.click();
        (_a = element.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(element);
    }
}
"use strict";
class App {
    constructor() {
    }
    static ifDebug(f) {
        if (App.debug)
            return f();
    }
    static log(...args) {
        if (!App.debug)
            return;
        const text = args.map(a => {
            if (typeof a === 'undefined' || a === null) {
                return '∅';
            }
            if (typeof a === 'string' || typeof a === 'number') {
                return `${a}`;
            }
            if (typeof a === 'object' && a.toString() !== '[object Object]') {
                return a.toString();
            }
            return JSON.stringify(a);
        }).join(' ');
        console.log(text);
    }
    static init() {
        App.project.setup();
        App.viewport.setup();
        App.background.setup();
        App.canvas.setup();
        App.foreground.setup();
        App.tools.setup();
        App.actions.setup();
        App.gui.setup();
        App.ui.setup();
        App.imageExporter.setup();
        // register systems
        App.ecs.registerSystem(Recycler);
        App.ecs.registerSystem(GridRenderer);
        // nb: order matters for these; it determines the
        // draw order
        App.ecs.registerSystem(RectangularRenderer);
        App.ecs.registerSystem(AxisConstraintRenderer);
        App.ecs.registerSystem(RoomRenderer);
        App.ecs.registerSystem(AngleRenderer);
        App.ecs.registerSystem(WallRenderer);
        App.ecs.registerSystem(WallJointRenderer);
        App.ecs.registerSystem(FurnitureRenderer);
        App.ecs.registerSystem(RulerRenderer);
        App.ecs.registerSystem(MarkupRenderer);
        App.ecs.registerSystem(DebugRenderer);
        App.ecs.registerSystem(ConstraintEnforcer);
        App.ecs.registerSystem(Kinematics);
        App.project.loadLocal();
        console.log(`
      hi! if you're here u probably are savvy enough that you'd like some hotkeys:
      ${App.keybindings.values().map(binding => `\n${formatKeyBinding(binding)}`).join('')}
    `.trim());
    }
    static update() {
        Time.tick();
        // important to get this up front before anything runs
        const isRendering = App.rendering.get();
        if (isRendering) {
            App.renderReady.set(false);
        }
        // nb: order matters, mostly bc it affects draw order
        // for things like tool actions.
        App.background.update();
        App.canvas.update();
        App.foreground.update();
        App.ecs.update();
        App.ui.update();
        App.tools.update();
        App.project.update();
        if (isRendering) {
            App.renderReady.set(true);
        }
    }
    static start() {
        App.pane.style.opacity = '0';
        App.init();
        setInterval(() => this.update(), 15);
        setTimeout(() => {
            // give images etc time to load and position, so
            // things don't look like they're glitching tf out
            // while the app is first loading.
            App.pane.style.opacity = '1';
        }, 100);
    }
}
App.ecs = new EntityComponentSystem();
App.pane = document.getElementsByClassName('canvas-wrap')[0];
App.referenceImages = document.getElementById('reference-images');
App.furnitureImages = document.getElementById('furniture-images');
App.uiJail = document.getElementById('ui-jail');
App.gui = new GUI();
App.tools = new Tools();
App.actions = new UserActions();
App.keybindings = Keybindings.defaults();
App.ui = new UiState();
App.viewport = new Viewport();
App.canvas = new Canvas2d(document.getElementById('main-canvas'), true);
App.background = new Canvas2d(document.getElementById('back-canvas'), false);
App.foreground = new VectorCanvas(document.getElementById('foreground-svg'));
App.settings = new Settings();
App.project = new Project();
App.io = new IoUtil();
App.history = new ProjectHistory();
App.imageExporter = new ImageExporter();
App.rendering = Refs.of(false);
App.renderReady = Refs.of(false);
App.debug = false;
setTimeout(() => App.start(), 10);
const DebugRenderer = (ecs) => {
    if (!App.debug)
        return;
    App.canvas.text({
        text: `fps: ${Time.fps}`,
        point: Position(new Point(App.viewport.screen_width - 20, App.viewport.screen_height - 20), 'screen'),
        align: 'right',
        baseline: 'bottom',
        fill: 'black',
    });
    const pressed = App.ui.pressedKeys;
    if (pressed.length > 0) {
        App.canvas.text({
            text: `keys: ${pressed.map(k => k === ' ' ? '⎵' : k).join('+')}`,
            point: Position(new Point(App.viewport.screen_width - 20, App.viewport.screen_height - 20 - App.settings.fontSize * 1.25), 'screen'),
            align: 'right',
            baseline: 'bottom',
            fill: 'black',
        });
    }
};
"use strict";
class FurnitureTool extends Tool {
    constructor() {
        super('furniture tool');
    }
    get allowSnap() {
        return true;
    }
    get icon() {
        return Icons.furniture;
    }
    get cursor() {
        return 'crosshair';
    }
    get description() {
        return 'add furniture, doors, and windows';
    }
    createUi(form) {
        form.addSelect({
            name: 'Furniture Type',
            value: Furniture.defaultFurnitureType,
            items: [
                { value: 'plain', icon: Icons.plain, },
                { value: 'wood', icon: Icons.wood, },
                { value: 'image', icon: Icons.image, },
                { value: 'door', icon: Icons.door, },
                { value: 'window', icon: Icons.window, },
            ],
        });
    }
    setup() {
        const filter = (h) => h.entity.has(Furniture) || h.control;
        this.events.onMouse('move', e => {
            if (App.ui.dragging)
                return;
            const handle = App.ui.getHandleAt(e.position, filter);
            if (handle !== null) {
                App.pane.style.cursor = handle.getContextualCursor();
                return;
            }
            App.pane.style.cursor = this.cursor;
        });
        this.events.onMouse('click', e => {
            const handle = App.ui.getHandleAt(e.position, h => h.entity.has(Furniture));
            if (handle !== null) {
                App.ui.select(handle);
                return;
            }
            // create a lil' piece of furniture
            const furniture = App.ecs.createEntity().add(Furniture, Furniture.defaultFurnitureType.get());
            furniture.rect.center = App.ui.mousePos;
            furniture.rect.width = Distance(34, 'model');
            furniture.rect.height = Distance(34, 'model');
            furniture.applyFurnitureTypeConstraints();
            App.tools.set('pointer tool');
            App.ui.setSelection(furniture.entity.only(Handle));
        });
        this.events.addDragListener({
            onStart: e => {
                const handle = App.ui.getHandleAt(e.start, filter);
                if (handle) {
                    App.ui.select(handle);
                    const events = App.ui.getDefaultDragHandler(filter);
                    events.handleDrag(e);
                    return events;
                }
                return this.getDrawFurnishing(e);
            },
            onUpdate: (e, events) => {
                events === null || events === void 0 ? void 0 : events.handleDrag(e);
            },
            onEnd: (e, events) => {
                events === null || events === void 0 ? void 0 : events.handleDrag(e);
                const selection = App.ui.selection;
                App.tools.set('pointer tool');
                App.ui.setSelection(...selection);
            }
        });
    }
    update() {
    }
    getDrawFurnishing(start) {
        const events = new UiEventDispatcher(FurnitureTool, 'draw furnishing');
        events.addDragListener({
            onStart: e => {
                const furniture = App.ecs.createEntity().add(Furniture, Furniture.defaultFurnitureType.get());
                furniture.rect.center = App.ui.snapPoint(e.start);
                App.ui.setSelection(furniture.entity.only(Handle));
                return furniture;
            },
            onUpdate: (e, furniture) => {
                let tl = App.ui.snapPoint(e.start);
                const end = App.ui.snapPoint(e.position);
                const delta = Vectors.between(tl, end);
                const right = Vector(Axis.X, 'screen');
                const down = Vector(Axis.Y, 'screen');
                if (delta.dot(right).sign < 0) {
                    tl = tl.plus(delta.onAxis(right));
                }
                if (delta.dot(down).sign < 0) {
                    tl = tl.plus(delta.onAxis(down));
                }
                furniture.rect.width = delta.dot(right).abs();
                furniture.rect.height = delta.dot(down).abs();
                furniture.rect.setLeft(tl);
                furniture.rect.setTop(tl);
            },
            onEnd: (e, furniture) => {
                furniture.applyFurnitureTypeConstraints();
            },
        });
        events.handleDrag(start);
        return events;
    }
}
App.tools.register(FurnitureTool);
"use strict";
var _a;
const createFurnitureType = (atts) => (Object.assign({ flippable: false, keepOnWall: false, onInit: (_) => { } }, atts));
//  'image' | 'plain' | 'wood' | 'door' | 'window';
const FurnitureTypes = {
    plain: createFurnitureType({}),
    wood: createFurnitureType({}),
    door: createFurnitureType({
        keepOnWall: true,
        flippable: true,
    }),
    window: createFurnitureType({
        keepOnWall: true,
    }),
    image: createFurnitureType({
        onInit: (f) => {
            if (!f.entity.has(Imaged)) {
                f.entity.add(Imaged, 'furniture').showUploadForm();
            }
        },
    }),
};
class Furniture extends Component {
    constructor(entity, furnitureType) {
        super(entity);
        this[_a] = true;
        this.attachRef = Refs.of(null, (a, b) => {
            if (a === b)
                return true;
            if (a === null || b === null)
                return false;
            return a.wall === b.wall
                && a.at === b.at
                && a.normal.get('model') === b.normal.get('model')
                && a.point.name === b.point.name;
        });
        this.flippedHorizontalRef = Refs.of(false);
        this.flippedVerticalRef = Refs.of(false);
        this.updatingOrientation = false;
        this.rect = entity.getOrCreate(Rectangular);
        this.rect.createHandle({
            priority: 2,
        });
        this.furnitureTypeRef = Refs.of(furnitureType);
        this.attachAllowedRef = Refs.mapRo(this.furnitureTypeRef, m => {
            if (FurnitureTypes[m].keepOnWall) {
                return (name) => name === 'center';
            }
            return (_) => true;
        });
        const labelLine = Refs.memoReduce((center, axis, width) => new MemoEdge(center.splus(width.scale(0.1), axis.neg()), center.splus(width.scale(0.1), axis)), this.rect.centerRef, this.rect.horizontalAxisRef, this.rect.widthRef);
        this.labelHandle = entity.ecs.createEntity().add(Handle, {
            clickable: true,
            hoverable: true,
            selectable: false,
            draggable: false,
            control: true,
            getPos: () => this.rect.center,
            distance: p => labelLine.get().distanceFrom(p),
            priority: 4,
            visible: () => this.furnitureType !== 'door' && this.furnitureType !== 'window',
        });
        this.labelHandle.events.onMouse('click', () => {
            Popup.input({
                title: 'Furniture Name',
                text: this.nameRef,
                position: App.ui.mousePos,
            });
        });
        entity.add(Form, () => {
            const form = new AutoForm();
            form.addSelect({
                name: 'Furniture Type',
                value: this.furnitureTypeRef,
                items: [
                    { value: 'plain', icon: Icons.plain, },
                    { value: 'wood', icon: Icons.wood, },
                    { value: 'image', icon: Icons.image, },
                    { value: 'door', icon: Icons.door, },
                    { value: 'window', icon: Icons.window, },
                ],
            });
            form.addButton({
                name: 'Flip Horizontally (f)',
                icon: Icons.flipH,
                enabled: Refs.mapRo(this.furnitureTypeRef, f => FurnitureTypes[f].flippable),
                onClick: () => this.flip('horizontal'),
            });
            form.addButton({
                name: 'Flip Vertically (Shift + F)',
                icon: Icons.flipV,
                enabled: Refs.mapRo(this.furnitureTypeRef, f => FurnitureTypes[f].flippable),
                onClick: () => this.flip('vertical'),
            });
            form.addButton({
                name: 'Align to Wall',
                icon: Icons.alignToWall,
                enabled: Refs.mapRo(this.attachRef, a => { var _b, _d; return !!((_d = (_b = a === null || a === void 0 ? void 0 : a.wall) === null || _b === void 0 ? void 0 : _b.entity) === null || _d === void 0 ? void 0 : _d.isAlive); }),
                onClick: () => this.alignToWall(),
            });
            form.addButton({
                name: 'Place on Wall',
                icon: Icons.moveToWall,
                enabled: Refs.mapRo(this.attachRef, a => { var _b, _d; return !!((_d = (_b = a === null || a === void 0 ? void 0 : a.wall) === null || _b === void 0 ? void 0 : _b.entity) === null || _d === void 0 ? void 0 : _d.isAlive); }),
                onClick: () => this.placeOnWall(),
            });
            form.addButton({
                name: 'Center on Wall',
                icon: Icons.centerOnWall,
                enabled: Refs.mapRo(this.attachRef, a => { var _b, _d; return !!((_d = (_b = a === null || a === void 0 ? void 0 : a.wall) === null || _b === void 0 ? void 0 : _b.entity) === null || _d === void 0 ? void 0 : _d.isAlive); }),
                onClick: () => this.centerOnWall(),
            });
            form.addButton({
                name: 'Move to Corner',
                icon: Icons.moveToCorner,
                enabled: Refs.mapRo(this.attachRef, a => { var _b, _d; return !!((_d = (_b = a === null || a === void 0 ? void 0 : a.wall) === null || _b === void 0 ? void 0 : _b.entity) === null || _d === void 0 ? void 0 : _d.isAlive); }),
                onClick: () => this.moveToCorner(),
            });
            return form;
        });
        const edgeListeners = new Map();
        this.furnitureTypeRef.onChange(m => {
            const hadImage = entity.has(Imaged);
            if (m !== 'image') {
                entity.removeAll(Imaged);
            }
            FurnitureTypes[m].onInit(this);
            if (hadImage !== entity.has(Imaged)) {
                App.ui.updateForms();
            }
            Furniture.defaultFurnitureType.set(m);
            this.applyFurnitureTypeConstraints();
            App.project.requestSave('changed furniture type');
        });
        this.flippedHorizontalRef.onChange(_ => App.project.requestSave('flipped furniture'));
        this.flippedVerticalRef.onChange(_ => App.project.requestSave('flipped furniture'));
        this.attachRef.onChange(a => {
            if (a === null)
                return;
            if (!edgeListeners.has(a.wall)) {
                edgeListeners.set(a.wall, edge => {
                    var _b;
                    if (((_b = this.attach) === null || _b === void 0 ? void 0 : _b.wall) !== a.wall)
                        return;
                    this.updateOrientation();
                });
            }
            a.wall.edgeRef.onChange(edgeListeners.get(a.wall));
            App.project.requestSave('attached to wall');
        });
        this.entity.only(Handle).events.addDragListener({
            onStart: e => {
                return true;
            },
            onUpdate: (_e, _c) => {
                this.attach = this.findAttach();
                const atts = FurnitureTypes[this.furnitureType];
                if (atts.keepOnWall) {
                    this.centerOnWall(true);
                }
            },
            onEnd: (_e, _c) => {
                this.attach = this.findAttach();
                this.applyFurnitureTypeConstraints();
            },
        });
        this.rect.rotationRef.onChange(() => {
            this.updateAttachRotation();
            this.updateAttachPosition();
        });
        this.rect.centerRef.onChange(() => this.updateAttachPosition());
        this.rect.widthRef.onChange(() => this.updateAttachPosition());
        this.rect.heightRef.onChange(() => this.updateAttachPosition());
        this.applyFurnitureTypeConstraints();
        if (this.furnitureType === 'image' && !entity.has(Imaged)) {
            entity.add(Imaged, 'furniture', this.rect).showUploadForm();
        }
    }
    applyFurnitureTypeConstraints() {
        const furnitureType = this.furnitureType;
        const atts = FurnitureTypes[furnitureType];
        if (atts.keepOnWall) {
            this.rect.allowResizeV.set(false);
            this.rect.allowRotate.set(false);
            this.rect.height = Distance(App.project.modelUnit.from({ value: 2, unit: 'inch' }).value, 'model');
        }
        else {
            this.rect.allowResizeV.set(true);
            this.rect.allowRotate.set(true);
        }
    }
    placeOnWall(alwaysAlign) {
        const attach = this.attach;
        if (!attach)
            return;
        const edge = attach.wall.edge;
        if (alwaysAlign || attach.normal.sign === 0) {
            this.rect.rotation = edge.tangent.neg().angle();
        }
        const highest = argmin(this.getDragPoints(), point => point, point => -Math.round(Vectors.between(edge.src, point.get())
            .dot(edge.normal).get('screen')));
        if (highest !== null) {
            attach.point = highest.arg;
            attach.normal = Distance(0, 'model');
            attach.at = edge.unlerp(attach.point.get());
            this.updateOrientation();
        }
    }
    centerOnWall(alwaysAlign) {
        const attach = this.attach;
        if (!attach)
            return;
        const edge = attach.wall.edge;
        if (alwaysAlign || attach.point.name === 'center' && attach.normal.sign === 0) {
            attach.rotation = Angle(Radians(Math.PI), 'model');
        }
        attach.point = this.entity.only(Handle).getDragClosure('complete').points
            .filter(p => p.name === 'center')[0];
        attach.normal = Distance(0, 'model');
        attach.at = edge.unlerp(attach.point.get());
        this.updateOrientation();
    }
    moveToCorner() {
        var _b, _d, _f;
        const attach = this.attach;
        if (!attach)
            return;
        const points = this.getDragPoints();
        if (points.length === 0)
            return;
        const normalDistance = (edge, point) => Vectors.between(edge.src, point.get()).dot(edge.normal).neg();
        const getClosestPoint = (edge, normal) => argmin(points, point => ({
            point,
            distance: normal ? normalDistance(edge, point) : edge.distanceFrom(point.get()),
        }), ({ distance }) => Math.round(distance.get('screen'))).result;
        const edge = attach.wall.edge;
        const adj1 = (_b = attach.wall.src.incoming) === null || _b === void 0 ? void 0 : _b.edge;
        const adj2 = (_d = attach.wall.dst.outgoing) === null || _d === void 0 ? void 0 : _d.edge;
        const adj = (_f = argmin([adj1, adj2], edge => {
            if (!edge)
                return 'invalid';
            const { point, distance } = getClosestPoint(edge, false);
            return { edge, point, distance };
        }, ({ distance }) => Math.round(distance.get('screen')))) === null || _f === void 0 ? void 0 : _f.result;
        if (!adj)
            return;
        const edgiest = getClosestPoint(edge, true).point;
        const adjiest = getClosestPoint(adj.edge, true).point;
        adjiest.set(adj.edge.closestPoint(adjiest.get()));
        attach.point = edgiest;
        attach.normal = Distance(0, 'model');
        attach.at = edge.unlerp(edgiest.get());
        this.updateOrientation();
    }
    alignToWall() {
        const attach = this.attach;
        if (!attach)
            return;
        this.rect.rotation = attach.wall.edge.tangent.neg().angle();
    }
    flip(axis) {
        if (axis === 'horizontal') {
            this.flippedHorizontalRef.set(!this.flippedHorizontalRef.get());
            return;
        }
        if (axis === 'vertical') {
            this.flippedVerticalRef.set(!this.flippedVerticalRef.get());
            return;
        }
        return impossible(axis);
    }
    updateOrientation() {
        const attach = this.attach;
        if (attach === null)
            return;
        this.updatingOrientation = true;
        const edge = attach.wall.edge;
        this.rect.rotation = edge.tangent.angle().plus(attach.rotation);
        attach.point.set(edge.lerp(attach.at).splus(attach.normal, edge.normal));
        this.updatingOrientation = false;
    }
    getDragPoints() {
        return this.entity.only(Handle)
            .getDragClosure('complete').points
            .filter(p => this.attachAllowed(p.name));
    }
    findAttach() {
        const epsDistance = Distance(0.1, 'model');
        const points = this.getDragPoints();
        const positions = points.map(p => p.get());
        const pointOrdering = points.map((_, i) => i);
        const furnitureAngle = this.rect.rotation;
        reverseInPlace(pointOrdering); // ensure midpoints come first
        const keepOnWall = FurnitureTypes[this.furnitureType].keepOnWall;
        const best = argmin(App.ecs.getComponents(Wall), wall => {
            const edge = wall.entity.only(PhysEdge).edge;
            const wallToCenter = Vectors.between(edge.midpoint, this.rect.center);
            const closest = argmin(pointOrdering, i => {
                const p = positions[i];
                const s = edge.unlerp(p);
                if (s < 0 || s > 1)
                    return 'invalid';
                const d = Vectors.between(edge.src, p).dot(edge.normal);
                if (!keepOnWall && d.gt(epsDistance)) {
                    return 'invalid'; // on the wrong side of the wall
                }
                return { at: s, distance: d };
            }, ({ distance }) => Math.round(Math.abs(distance.get('screen'))));
            if (closest === null) {
                return 'invalid';
            }
            const { arg: index, result } = closest;
            const line = new MemoEdge(positions[index], wall.edge.lerp(result.at));
            for (const other of App.ecs.getComponents(Wall)) {
                if (other !== wall && other.edge.intersection(line) !== null) {
                    return 'invalid';
                }
            }
            return {
                wall,
                point: points[index],
                normal: result.distance,
                at: result.at,
                rotation: furnitureAngle.minus(edge.tangent.angle()),
            };
        }, attach => Math.abs(Math.round(attach.normal.get('screen'))));
        return (best === null || best === void 0 ? void 0 : best.result) || null;
    }
    updateAttachRotation() {
        if (this.updatingOrientation)
            return;
        const attach = this.attach;
        if (attach === null)
            return;
        const rotation = this.rect.rotation;
        attach.rotation = rotation.minus(attach.wall.edge.tangent.angle());
    }
    updateAttachPosition() {
        if (this.updatingOrientation)
            return;
        const attach = this.attach;
        if (attach === null)
            return;
        const position = attach.point.get();
        const edge = attach.wall.edge;
        attach.at = edge.unlerp(position);
        attach.normal = edge.normal.dot(Vectors.between(edge.src, position));
    }
    attachAllowed(name) {
        const filter = this.attachAllowedRef.get();
        return filter(name);
    }
    get furnitureType() {
        return this.furnitureTypeRef.get();
    }
    set furnitureType(m) {
        this.furnitureTypeRef.set(m);
    }
    get attach() {
        var _b, _d;
        const attach = this.attachRef.get();
        if (!((_d = (_b = attach === null || attach === void 0 ? void 0 : attach.wall) === null || _b === void 0 ? void 0 : _b.entity) === null || _d === void 0 ? void 0 : _d.isAlive))
            return null;
        return attach;
    }
    set attach(a) {
        this.attachRef.set(a);
    }
    tearDown() {
        this.labelHandle.entity.destroy();
    }
    toJson() {
        const attach = this.attach;
        const json = {
            attach: attach === null ? false : {
                wall: attach.wall.entity.id,
                at: attach.at,
                normal: MoreJson.distance.to(attach.normal),
                point: attach.point.name,
                rotation: MoreJson.angle.to(attach.rotation),
            },
            furnitureType: this.furnitureType,
            flippedHorizontal: this.flippedHorizontalRef.get(),
            flippedVertical: this.flippedVerticalRef.get(),
        };
        return {
            factory: this.constructor.name,
            arguments: [json],
        };
    }
}
_a = SOLO;
Furniture.defaultFurnitureType = Refs.of('wood');
ComponentFactories.register(Furniture, (entity, propsJson) => {
    var _b;
    const props = propsJson;
    if (!entity.has(Rectangular)) {
        return 'not ready';
    }
    if (props.furnitureType === 'image' && !entity.has(Imaged)) {
        return 'not ready';
    }
    if (props.attach && !((_b = App.ecs.getEntity(props.attach.wall)) === null || _b === void 0 ? void 0 : _b.has(Wall))) {
        return 'not ready';
    }
    const furniture = entity.getOrCreate(Furniture, props.furnitureType || 'plain');
    if (props.furnitureType) {
        // possibly not redundant with above, if we're in the "get"
        // part of "getOrCreate".
        furniture.furnitureType = props.furnitureType;
    }
    furniture.flippedHorizontalRef.set(!!propsJson.flippedHorizontal);
    furniture.flippedVerticalRef.set(!!propsJson.flippedVertical);
    if (props.attach) {
        const attach = props.attach;
        furniture.attach = !attach ? null : {
            wall: App.ecs.getEntity(attach.wall).only(Wall),
            at: attach.at,
            normal: MoreJson.distance.from(attach.normal),
            point: entity.only(Handle).getDragClosure('complete').points
                .filter(p => p.name === attach.point)[0],
            rotation: MoreJson.angle.from(attach.rotation),
        };
    }
    return furniture;
});
const FurnitureRenderer = (ecs) => {
    const renderFurnitureType = (furniture) => {
        const rect = furniture.rect;
        const furnitureType = furniture.furnitureType;
        const drawNarrow = (pixels) => {
            const rect = furniture.rect;
            const origin = Positions.zero('screen');
            const vertical = rect.verticalAxis.to('screen').unit().scale(pixels);
            const horizontal = rect.rightRad.to('screen');
            App.canvas.beginPath();
            App.canvas.moveTo(origin.plus(horizontal).plus(vertical));
            App.canvas.lineTo(origin.plus(horizontal).plus(vertical.neg()));
            App.canvas.lineTo(origin.minus(horizontal).plus(vertical.neg()));
            App.canvas.lineTo(origin.minus(horizontal).plus(vertical));
            App.canvas.closePath();
        };
        App.canvas.lineWidth = 1;
        App.canvas.setLineDash([]);
        if (furnitureType === 'plain') {
            App.canvas.lineWidth = 2;
            App.canvas.fillStyle = 'lightgray';
            App.canvas.strokeStyle = 'darkgray';
            App.canvas.polygon(rect.polygon);
            App.canvas.fill();
            App.canvas.stroke();
        }
        else if (furnitureType === 'wood') {
            App.canvas.lineWidth = 2;
            App.canvas.fillStyle = 'hsl(30, 60%, 60%)';
            App.canvas.strokeStyle = 'hsl(30, 60%, 30%)';
            App.canvas.polygon(rect.polygon);
            App.canvas.fill();
            App.canvas.stroke();
            App.canvas.lineWidth = 1;
            const margin = Distance(10, 'screen').min(rect.height.scale(0.5));
            const inset1 = Distance(20, 'screen').min(rect.width);
            const inset2 = Distance(60, 'screen').min(rect.width);
            const mg = (v) => v.minus(v.unit().scale(margin));
            App.canvas.strokeLine(rect.left.splus(inset1, rect.horizontalAxis).plus(mg(rect.upRad)), rect.right.splus(inset2.neg(), rect.horizontalAxis).plus(mg(rect.upRad)));
            App.canvas.strokeLine(rect.left.splus(inset2, rect.horizontalAxis).plus(mg(rect.downRad)), rect.right.splus(inset1.neg(), rect.horizontalAxis).plus(mg(rect.downRad)));
        }
        else if (furnitureType === 'door') {
            App.canvas.pushTransform();
            App.canvas.translateTo(rect.center);
            App.canvas.rotate(Angle(furniture.flippedVerticalRef.get() ? Radians(Math.PI) : Radians(0), 'screen'));
            App.canvas.lineWidth = 1;
            App.canvas.strokeStyle = 'black';
            drawNarrow(5);
            App.canvas.stroke();
            // draw white rect to 'break' the attached wall
            App.canvas.pushTransform();
            App.canvas.translate(rect.verticalAxis.to('screen').unit().scale(8));
            drawNarrow(16);
            App.canvas.fillStyle = 'white';
            App.canvas.fill();
            App.canvas.popTransform();
            App.canvas.fillStyle = '#dedede';
            drawNarrow(5);
            App.canvas.fill();
            if (furniture.entity.only(Handle).isActive) {
                drawNarrow(5);
                App.canvas.stroke();
            }
            // doors... open o:
            App.canvas.lineWidth = 2;
            App.canvas.setLineDash([4, 4]);
            App.canvas.strokeStyle = 'gray';
            App.canvas.beginPath();
            const origin = Positions.zero('screen');
            if (furniture.flippedHorizontalRef.get() !== furniture.flippedVerticalRef.get()) {
                const startAngle = rect.horizontalAxis.to('screen').neg().angle().normalize();
                const startPos = origin.plus(rect.rightRad);
                App.canvas.arc(startPos, rect.width, startAngle, startAngle.plus(Angle(Radians(Math.PI / 2), 'screen')).normalize(), false);
                App.canvas.stroke();
                App.canvas.setLineDash([]);
                App.canvas.lineWidth = 1;
                App.canvas.strokeLine(startPos, startPos.splus(rect.width, rect.upRad.to('screen').unit()));
            }
            else {
                const startAngle = rect.horizontalAxis.to('screen').angle();
                const startPos = origin.plus(rect.leftRad);
                App.canvas.arc(startPos, rect.width, startAngle, startAngle.minus(Angle(Radians(Math.PI / 2), 'screen')).normalize(), true);
                App.canvas.stroke();
                App.canvas.setLineDash([]);
                App.canvas.lineWidth = 1;
                App.canvas.strokeLine(startPos, startPos.splus(rect.width, rect.upRad.to('screen').unit()));
            }
            App.canvas.popTransform();
        }
        else if (furnitureType === 'window') {
            App.canvas.lineWidth = 1;
            App.canvas.strokeStyle = 'black';
            // sill
            const sill = Distance(4, 'screen');
            const sillh = rect.horizontalAxis.scale(sill);
            const sillv = rect.verticalAxis.neg().scale(sill).scale(2);
            App.canvas.fillStyle = 'white';
            App.canvas.beginPath();
            App.canvas.moveTo(rect.left.minus(sillh));
            App.canvas.lineTo(rect.left.minus(sillh).plus(sillv));
            App.canvas.lineTo(rect.right.plus(sillh).plus(sillv));
            App.canvas.lineTo(rect.right.plus(sillh));
            App.canvas.closePath();
            App.canvas.fill();
            App.canvas.stroke();
            // frame
            App.canvas.fillStyle = 'lightgray';
            App.canvas.pushTransform();
            App.canvas.translateTo(rect.center);
            drawNarrow(3);
            App.canvas.fill();
            App.canvas.stroke();
            App.canvas.popTransform();
        }
        App.canvas.lineWidth = 1;
        App.canvas.setLineDash([]);
    };
    const renderAttachment = (furniture) => {
        const attach = furniture.attach;
        if (attach !== null) {
            const edge = attach.wall.edge;
            App.canvas.strokeStyle = PINK;
            App.canvas.lineWidth = 2;
            App.canvas.setLineDash([4, 2]);
            App.canvas.strokeLine(attach.point.get(), edge.lerp(attach.at));
            App.canvas.lineWidth = 1;
            App.canvas.setLineDash([]);
        }
    };
    const renderActive = (furniture) => {
        const rect = furniture.rect;
        App.canvas.polygon(rect.polygon.pad(Distance(3, 'screen'), rect.rightRad, rect.upRad));
        App.canvas.setLineDash([8, 4]);
        App.canvas.lineWidth = 1;
        App.canvas.strokeStyle = BLUE;
        App.canvas.stroke();
        App.canvas.text({
            text: App.project.formatDistance(rect.width),
            fill: BLUE,
            align: 'center',
            baseline: 'middle',
            point: rect.top.splus(Distance(App.settings.fontSize, 'screen'), rect.upRad.unit()),
            axis: rect.rightRad,
            keepUpright: true,
        });
        if (furniture.furnitureType !== 'window' && furniture.furnitureType !== 'door') {
            App.canvas.text({
                text: App.project.formatDistance(rect.height),
                fill: BLUE,
                align: 'center',
                baseline: 'middle',
                point: rect.left.splus(Distance(App.settings.fontSize, 'screen'), rect.leftRad.unit()),
                axis: rect.upRad,
                keepUpright: true,
            });
        }
        App.canvas.lineWidth = 1;
        App.canvas.setLineDash([]);
    };
    const renderLabel = (furniture) => {
        if (!furniture.labelHandle.visible)
            return;
        const rect = furniture.rect;
        const draw = (fill, offset = Vectors.zero('screen')) => App.canvas.text({
            text: furniture.name,
            point: rect.center.to('screen').plus(offset),
            axis: rect.horizontalAxis,
            keepUpright: true,
            align: 'center',
            baseline: 'middle',
            fill,
        });
        const active = furniture.labelHandle.isHovered;
        if (active) {
            const baseline = rect.center.splus(Distance(App.settings.fontSize / 2, 'screen'), rect.verticalAxis.scale(rect.verticalAxis.dot(Vector(Axis.Y, 'screen')).sign));
            App.canvas.lineWidth = 1;
            App.canvas.strokeStyle = BLUE;
            App.canvas.strokeLine(baseline.splus(0.75, rect.leftRad), baseline.splus(0.75, rect.rightRad));
            draw(PINK, Vector(new Vec(-1, -1), 'screen'));
            draw(PINK, Vector(new Vec(1, -1), 'screen'));
            draw(BLUE, Vector(new Vec(-1, 1), 'screen'));
            draw(BLUE, Vector(new Vec(1, 1), 'screen'));
        }
        draw(active ? 'white' : 'black');
    };
    for (const furniture of ecs.getComponents(Furniture)) {
        const handle = furniture.entity.only(Handle);
        if (!furniture.entity.has(Imaged)) {
            renderFurnitureType(furniture);
        }
        renderLabel(furniture);
        if (!handle.isActive)
            continue;
        renderAttachment(furniture);
        renderActive(furniture);
    }
};
"use strict";
const getImageLayerCanvas = (layer) => {
    if (layer === 'reference')
        return App.referenceImages;
    if (layer === 'furniture')
        return App.furnitureImages;
    return impossible(layer);
};
class Imaged extends Component {
    constructor(entity, layer, rect) {
        super(entity);
        this.zindexRef = Refs.of(0);
        this.image = new Image();
        this.zindexRef.set(Imaged.ZINDEX_ARRAY.length);
        Imaged.ZINDEX_ARRAY.push(this);
        this.rect = typeof rect !== 'undefined'
            ? rect : entity.getOrCreate(Rectangular);
        this.rect.keepAspect = true;
        this.opacity = Refs.of(layer === 'reference' ? Imaged.DEFAULT_OPACITY : 1);
        this.element = new Image();
        this.element.style.position = 'absolute';
        this.element.style.display = 'none';
        this.updateElement();
        this.layer = layer;
        this.canvas = getImageLayerCanvas(this.layer);
        this.canvas.appendChild(this.element);
        this.rect.centerRef.onChange(_ => this.updateElement());
        this.rect.widthRef.onChange(_ => this.updateElement());
        this.rect.heightRef.onChange(_ => this.updateElement());
        this.rect.rotationRef.onChange(_ => this.updateElement());
        this.opacity.onChange(o => {
            this.element.style.opacity = `${o}`;
            App.project.requestSave('image opacity changed');
        });
        this.form = entity.add(Form, () => {
            const form = new AutoForm();
            form.addButton({
                name: 'Upload Image',
                icon: Icons.imageUpload,
                onClick: () => {
                    const img = entity.getOrCreate(Imaged, 'furniture');
                    img.showUploadForm();
                },
            });
            form.add({
                kind: 'slider',
                name: 'opacity',
                label: 'opacity',
                value: this.opacity,
                min: 0,
                max: 1,
            });
            form.addButton({
                name: 'Send to Back',
                icon: Icons.toBack,
                onClick: () => this.toBack(),
            });
            form.addButton({
                name: 'Bring to Front',
                icon: Icons.toFront,
                onClick: () => this.toFront(),
            });
            form.addButton({
                name: 'Reset Aspect Ratio',
                icon: Icons.resetAspectRatio,
                onClick: () => this.resetAspectRatio(),
            });
            return form;
        });
    }
    get zindex() {
        return this.zindexRef.get();
    }
    get width() {
        return this.rect.width;
    }
    set width(d) {
        this.rect.width = d;
    }
    get height() {
        return this.rect.height;
    }
    set height(d) {
        this.rect.height = d;
    }
    get center() {
        return this.rect.center;
    }
    set center(p) {
        this.rect.center = p;
    }
    get rotation() {
        return this.rect.rotation;
    }
    setSrc(url) {
        this.image.onload = () => {
            App.project.requestSave('image uploaded');
            if (!this.rectHasSize()) {
                this.rectToImageDimensions();
            }
            this.updateElement();
        };
        this.image.src = url.toString();
        this.element.src = url.toString();
        if (!this.rectHasSize()) {
            this.rectToImageDimensions();
        }
        this.updateElement();
        // idk what race condition i have that makes this help =/
        setTimeout(() => this.updateElement(), 100);
    }
    toBack() {
        this.canvas.removeChild(this.element);
        this.canvas.prepend(this.element);
        Imaged.ZINDEX_ARRAY.splice(this.zindexRef.get(), 1);
        Imaged.ZINDEX_ARRAY.unshift(this);
        this.zindexRef.set(0);
    }
    toFront() {
        this.canvas.removeChild(this.element);
        this.canvas.appendChild(this.element);
        Imaged.ZINDEX_ARRAY.splice(this.zindexRef.get(), 1);
        Imaged.ZINDEX_ARRAY.push(this);
        this.zindexRef.set(Imaged.ZINDEX_ARRAY.length - 1);
    }
    updateElement() {
        const pos = this.center.get('screen');
        const width = this.width.get('screen');
        const height = this.height.get('screen');
        const angle = toDegrees(this.rect.rotation.get('screen'));
        this.element.style.opacity = `${this.opacity.get()}`;
        this.element.style.left = `${pos.x}px`;
        this.element.style.top = `${pos.y}px`;
        this.element.style.width = `${width}px`;
        this.element.style.height = `${height}px`;
        this.element.style.transform = `translate(-${width / 2}px, -${height / 2}px) rotate(${angle}deg)`;
        this.element.style.display = width > 0 && height > 0 ? 'block' : 'none';
    }
    showUploadForm() {
        App.io.open([
            '.gif',
            '.jpeg',
            '.jpg',
            '.png',
            '.svg',
            '.webm',
        ], url => this.setSrc(url));
    }
    cleanup() {
        if (this.layer === 'reference' && !this.image.src) {
            this.entity.destroy();
        }
    }
    resetAspectRatio() {
        this.rect.keepAspect = false;
        const ratio = this.image.width / this.image.height;
        this.rect.width = this.rect.height.scale(ratio);
        this.rect.keepAspect = true;
    }
    rectToImageDimensions() {
        const keepAspect = this.rect.keepAspect;
        this.rect.keepAspect = false;
        this.width = Distance(this.image.width, 'screen');
        this.height = Distance(this.image.height, 'screen');
        this.rect.keepAspect = keepAspect;
    }
    rectHasSize() {
        const w = this.width.get('screen');
        const h = this.height.get('screen');
        return w > 1 && h > 1;
    }
    getDataUrl() {
        const canvas = document.createElement('canvas');
        canvas.width = this.image.width;
        canvas.height = this.image.height;
        const g = canvas.getContext('2d');
        g.drawImage(this.image, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        return dataUrl;
    }
    getStableUrl() {
        const src = this.image.src;
        if (src.startsWith('blob:')) {
            return this.getDataUrl();
        }
        return src;
    }
    tearDown() {
        var _a;
        if (Imaged.ZINDEX_ARRAY[this.zindexRef.get()] === this) {
            Imaged.ZINDEX_ARRAY.splice(this.zindexRef.get(), 1);
        }
        (_a = this.element.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(this.element);
        this.entity.remove(this.form);
    }
    toJson() {
        return {
            factory: this.constructor.name,
            arguments: [
                this.getStableUrl(),
                this.opacity.get(),
                this.layer,
            ],
        };
    }
}
Imaged.DEFAULT_OPACITY = 0.5;
Imaged.ZINDEX_ARRAY = Array();
ComponentFactories.register(Imaged, (entity, url, opacity, layer) => {
    const imaged = entity.getOrCreate(Imaged, layer);
    imaged.setSrc(url);
    imaged.opacity.set(typeof opacity !== 'undefined'
        ? opacity : Imaged.DEFAULT_OPACITY);
    return imaged;
});
"use strict";
// specifically, reference images
class ImagesTool extends Tool {
    constructor() {
        super('images tool');
    }
    get icon() {
        return Icons.image;
    }
    get cursor() {
        return 'cell';
    }
    get description() {
        return 'add reference images';
    }
    get allowSnap() {
        return true;
    }
    createUi(ui) {
    }
    onToolSelected() {
    }
    onToolDeselected() {
        App.ecs.getComponents(Imaged)
            .filter(img => img.layer === 'reference')
            .forEach(m => m.cleanup());
    }
    setup() {
        App.viewport.onChange(() => App.ecs.getComponents(Imaged)
            .forEach(m => m.updateElement()));
        const resizeThreshold = Distance(20, 'screen');
        this.events.onMouse('click', e => {
            const images = App.ecs.getComponents(Imaged)
                .filter(img => img.layer === 'reference')
                .filter(img => img.entity.has(Handle))
                .filter(img => img.entity.only(Rectangular).contains(e.position))
                .sort((a, b) => b.zindex - a.zindex)
                .map(img => img.entity.only(Handle));
            const image = images.length > 0 ? images[0] : null;
            if (image) {
                App.ui.select(image);
                return;
            }
            this.addReferenceImage(e.position);
        });
        this.events.onMouse('move', e => {
            if (App.ecs.getComponents(Dragging).length > 0)
                return;
            const image = App.ui.getHandleAt(e.position, h => h.isSpecificallyFor(this.name));
            if (image === null) {
                App.pane.style.cursor = this.cursor;
            }
            else {
                App.pane.style.cursor = image.getContextualCursor();
            }
        });
        this.events.addDragListener({
            onStart: e => {
                const events = App.ui.getDefaultDragHandler(h => h.isSpecificallyFor(this.name));
                events.handleDrag(e);
                return events;
            },
            onUpdate: (e, events) => events.handleDrag(e),
            onEnd: (e, events) => events.handleDrag(e),
        });
    }
    update() { }
    addReferenceImage(position) {
        const entity = App.ecs.createEntity();
        const rect = entity.add(Rectangular);
        rect.center = position;
        rect.createHandle({
            tools: ['images tool'],
        });
        const img = entity.add(Imaged, 'reference');
        img.showUploadForm();
    }
}
App.tools.register(ImagesTool);
"use strict";
class JointTool extends Tool {
    constructor() {
        super('joint tool');
    }
    get icon() {
        return Icons.jointTool;
    }
    get allowSnap() {
        return true;
    }
    get cursor() {
        return `url('${Icons.pen}') 4 4, default`;
    }
    setup() {
        this.events.onMouse('click', e => {
            const joint = App.ui.getHandleAt(e.position, h => h.entity.has(WallJoint));
            if (joint !== null) {
                App.ui.select(joint);
                return;
            }
            const wall = App.ui.getHandleAt(e.position, h => h.entity.has(Wall));
            if (wall !== null) {
                this.split(wall.entity.only(Wall), e.position);
                return;
            }
            App.ui.clearSelection();
        });
        this.events.onMouse('move', e => {
            var _a;
            const handle = App.ui.getHandleAt(e.position, h => h.entity.has(Wall) || h.entity.has(WallJoint));
            if (handle === null) {
                App.pane.style.cursor = 'default';
                App.ui.clearHovered();
            }
            else if (handle.entity.has(Wall)) {
                App.pane.style.cursor = this.cursor;
            }
            else if (handle.entity.has(WallJoint)) {
                App.pane.style.cursor = 'pointer';
            }
            if ((_a = handle === null || handle === void 0 ? void 0 : handle.entity) === null || _a === void 0 ? void 0 : _a.has(WallJoint)) {
                App.ui.setHovered(handle);
            }
        });
        const pointer = App.tools.getTool('pointer tool');
        this.events.addDragListener({
            onStart: e => {
                const joint = App.ui.getHandleAt(e.start, h => h.entity.has(WallJoint));
                if (joint === null)
                    return null;
                App.ui.select(joint);
                pointer.events.handleDrag(e);
            },
            onUpdate: (e, _joint) => {
                pointer.events.handleDrag(e);
            },
            onEnd: (e, _joint) => {
                pointer.events.handleDrag(e);
            },
        });
    }
    update() {
    }
    onToolSelected() {
        App.ui.clearSelection();
    }
    split(wall, position) {
        const split = wall.splitWall(position);
        if (split === null)
            return;
        const [one, two] = split;
        const joint = one.dst;
        App.ui.setSelection(joint.entity.only(Handle));
    }
}
App.tools.register(JointTool);
"use strict";
/**
 * Returns a function that wraps a value of a representation type in a newtype.
 */
function newtype() {
    return x => x;
}
/**
 * Unwrap a newtype, inferring the appropriate underlying type
 */
function unwrap(x) {
    return x;
}
/**
 * Lift a function on a representation type to a function on a newtype that
 * wraps it.
 */
function liftN(f) {
    return f;
}
/**
 * Lift a function of two arguments on a representation type to a function on a
 * newtype that wraps it.
 */
function liftN2(f) {
    return f;
}
"use strict";
class PanTool extends Tool {
    constructor() {
        super('pan tool');
    }
    get icon() {
        return Icons.panTool;
    }
    get cursor() {
        return 'grab';
    }
    get description() {
        return 'middle-click + drag, right-click + drag, or hold Alt';
    }
    setup() {
        this.events.addDragListener({
            onStart: (e) => {
                // have to save original transformations
                return ({
                    origin: App.viewport.origin,
                    project: App.viewport.project,
                    unproject: App.viewport.unproject,
                });
            },
            onUpdate: (e, context) => {
                const { origin, project, unproject } = context;
                App.viewport.origin = origin.minus(unproject.vec(e.delta.get('screen')));
                App.viewport.updateTransforms();
                return context;
            },
            onEnd: (e, context) => {
            },
        });
    }
    update() { }
}
App.tools.register(PanTool);
"use strict";
class PointerTool extends Tool {
    constructor() {
        super('pointer tool');
        this.selectionRect = Refs.of(null, (a, b) => {
            if ((a === null) !== (b === null)) {
                return false;
            }
            if (a === null || b === null)
                return true;
            return a.eq(b);
        });
        this.strictSelect = Refs.of(false);
        this.lastClickHandle = null;
        this.lastClickTime = 0;
        this.lastClickPoint = Point.ZERO;
    }
    get icon() {
        return Icons.pointerTool;
    }
    get allowSnap() {
        return true;
    }
    setup() {
        this.strictSelect.onChange(strict => {
            if (strict)
                App.ui.clearHovered();
        });
        this.events.onKey('keydown', e => {
            if (e.key === 'Escape') {
                App.ui.clearSelection();
                App.ui.cancelDrag();
            }
        });
        this.events.onMouse('down', e => {
            const handle = App.ui.getHandleAt(e.position, h => h.clickable || h.draggable || h.selectable);
            if (handle === null && !App.ui.multiSelecting) {
                App.ui.clearSelection();
            }
        });
        this.events.onMouse('click', e => {
            const doubleClicking = (Time.now - this.lastClickTime) < 0.5
                && Vec.between(e.position.get('screen'), this.lastClickPoint).mag() < 5;
            this.lastClickTime = Time.now;
            this.lastClickPoint = e.position.get('screen');
            const handle = App.ui.getHandleAt(e.position, h => h.clickable || h.selectable);
            if (handle === null) {
                if (doubleClicking) {
                    const forOtherTool = App.ui.getHandleAt(e.position, h => h.clickable, true);
                    if (forOtherTool) {
                        forOtherTool.selectWithAppropriateTool();
                        return;
                    }
                }
                App.ui.clearSelection();
                this.lastClickHandle = null;
                return;
            }
            if (handle.clickable) {
                if (this.lastClickHandle === handle && doubleClicking) {
                    // handle double-click
                    if (handle.entity.has(Wall)) {
                        // nb: we could reference it directly, but this will
                        // make the UI buttons flicker, which is good for
                        // letting ppl know where the tool is.
                        App.tools.getTool('joint tool').events.handleMouse(e);
                        return;
                    }
                }
                this.lastClickHandle = handle;
                handle.events.handleMouse(e);
            }
            if (handle.selectable) {
                if (App.ui.multiSelecting) {
                    if (handle.isSelected) {
                        handle.selected = false;
                    }
                    else {
                        App.ui.addSelection(handle);
                    }
                }
                else {
                    App.ui.setSelection(handle);
                }
            }
        });
        this.events.onMouse('move', e => {
            if (App.ui.dragging)
                return;
            const handle = App.ui.getHandleAt(e.position, h => h.clickable || h.draggable);
            if ((handle === null || handle === void 0 ? void 0 : handle.clickable) || (handle === null || handle === void 0 ? void 0 : handle.draggable)) {
                App.pane.style.cursor = handle.getContextualCursor() || this.cursor;
                if (handle.control) {
                    handle.hovered = true;
                }
                else {
                    App.ui.setHovered(handle);
                }
                return;
            }
            App.pane.style.cursor = this.cursor;
            App.ui.clearHovered();
        });
        const drawSelect = this.getDrawSelectDispatcher();
        this.events.addDragListener({
            onStart: e => {
                const overHandle = App.ui.getHandleAt(e.start, h => h.draggable) !== null;
                if (overHandle) {
                    const handler = App.ui.defaultDragHandler;
                    handler.handleDrag(e);
                    return handler;
                }
                drawSelect.handleDrag(e);
                return drawSelect;
            },
            onUpdate: (e, dispatcher) => dispatcher.handleDrag(e),
            onEnd: (e, dispatcher) => {
                dispatcher.handleDrag(e);
                App.pane.style.cursor = 'default';
            },
        });
    }
    update() {
        if (App.rendering.get())
            return;
        this.renderKnobs();
        const rect = this.selectionRect.get();
        if (rect === null)
            return;
        const palette = this.strictSelect.get()
            ? ['hsla(348,79%,81%,0.3)', 'hsla(348,79%,20%,0.3)']
            : ['hsla(196,94%,66%,0.3)', 'hsla(196,94%,20%,0.3)'];
        const [fill, stroke] = palette;
        App.canvas.fillStyle = fill;
        App.canvas.strokeStyle = stroke;
        App.canvas.lineWidth = 1;
        App.canvas.rect(rect);
        App.canvas.fill();
        App.canvas.stroke();
    }
    renderKnobs() {
        const selectionSize = App.ui.selection.size;
        const handleDrawRadius = Distance(100, 'screen');
        const shouldRender = (h) => {
            if (h.knob === null)
                return false;
            if (h.dragging)
                return true;
            const parent = h.knob.parent.only(Handle);
            return selectionSize <= 1 && parent.isActive;
        };
        const handles = App.ecs.getComponents(Handle).filter(shouldRender);
        for (const h of handles) {
            App.ui.renderKnob(h);
        }
    }
    getDrawSelectDispatcher() {
        const dispatcher = new UiEventDispatcher(PointerTool, 'Rectangular Select');
        const rectFor = (e) => {
            const rect = new Rect(e.start, e.position);
            this.selectionRect.set(rect);
            return rect;
        };
        dispatcher.addDragListener({
            onStart: e => {
                App.pane.style.cursor = 'default';
                rectFor(e);
                return 0;
            },
            onUpdate: (e, _) => {
                App.pane.style.cursor = 'default';
                const rect = rectFor(e);
                const strict = this.useStrictSelectFor(e);
                this.strictSelect.set(strict);
                const selectables = App.ecs.getComponents(Handle)
                    .filter(h => h.selectable && h.isForTool(this.name));
                for (const s of selectables) {
                    s.hovered = strict ? s.containedBy(rect) : s.intersects(rect);
                }
            },
            onEnd: (e, _) => {
                App.pane.style.cursor = 'default';
                const rect = rectFor(e);
                const strict = this.useStrictSelectFor(e);
                const selected = App.ecs.getComponents(Handle)
                    .filter(h => h.selectable && h.isForTool(this.name))
                    .filter(h => strict ? h.containedBy(rect) : h.intersects(rect));
                App.ui.clearHovered();
                App.ui.addSelection(...selected);
                this.selectionRect.set(null);
            },
        });
        return dispatcher;
    }
    useStrictSelectFor(e) {
        const delta = Vectors.between(e.start, e.position).get('screen');
        return delta.x < 0 && delta.y < 0;
    }
}
App.tools.register(PointerTool);
"use strict";
class DrawRoomTool extends Tool {
    constructor() {
        super('room tool');
        this.drawingRoom = null;
        this.events.addDragListener({
            onStart: e => {
                const start = App.ui.snapPoint(e.start);
                const walls = Array(4).fill(0)
                    .map(_ => App.ecs.createEntity().add(Wall));
                for (let i = 0; i < walls.length; i++) {
                    walls[i].src.pos = start;
                    walls[i].dst = walls[(i + 1) % walls.length].src;
                }
                const room = App.ecs.createEntity().add(Room);
                this.drawingRoom = room;
                walls.forEach(wall => room.addWall(wall));
                return room;
            },
            onUpdate: (e, room) => {
                const diagonal = new SpaceEdge(App.ui.snapPoint(e.start), App.ui.snapPoint(e.position));
                const horizontal = diagonal.vector.onAxis(Vector(Axis.X, 'screen'));
                const vertical = diagonal.vector.onAxis(Vector(Axis.Y, 'screen'));
                const negH = horizontal.get('screen').dot(Axis.X) < 0;
                const negV = vertical.get('screen').dot(Axis.Y) < 0;
                // allow drawing walls inside-out (for e.g. interior partitions) if
                // the mouse is dragged to the up-left. 
                const reversed = negH && negV;
                for (let i = 0; i < room.walls.length; i++) {
                    let pos = diagonal.src;
                    const rightEdge = (i === 1 || i === 2);
                    const bottomEdge = (i >= 2);
                    if (rightEdge !== negH)
                        pos = pos.plus(horizontal);
                    if (bottomEdge !== negV)
                        pos = pos.plus(vertical);
                    if (reversed) {
                        room.walls[room.walls.length - i - 1].dst.pos = pos;
                    }
                    else {
                        room.walls[i].src.pos = pos;
                    }
                }
            },
            onEnd: (e, room) => {
                this.drawingRoom = null;
                this.mergeIntersectingRooms(room);
                App.project.requestSave('finished drawing a new room');
            },
        });
    }
    get icon() {
        return Icons.roomTool;
    }
    get allowSnap() {
        return true;
    }
    onToolSelected() {
        App.ui.clearSelection();
    }
    get cursor() {
        return 'crosshair';
    }
    setup() { }
    update() {
        const room = this.drawingRoom;
        if (room === null)
            return;
        for (const other of App.ecs.getComponents(Room)) {
            if (other === room)
                continue;
            const intersections = this.getIntersections(room, other);
            for (const hit of intersections) {
                App.canvas.strokeStyle = 'blue';
                App.canvas.lineWidth = 1;
                App.canvas.strokeCircle(hit.position, Distance(10, 'screen'));
            }
        }
    }
    mergeIntersectingRooms(room) {
        let operand = room;
        for (const other of App.ecs.getComponents(Room)) {
            if (other === operand)
                continue;
            const result = this.mergeRooms(other, operand);
            operand = result.room;
            if (operand === null) {
                return;
            }
        }
    }
    getIntersections(one, two) {
        const results = [];
        for (const wall1 of one.walls) {
            for (const wall2 of two.walls) {
                const position = wall1.edge.intersection(wall2.edge);
                if (position === null)
                    continue;
                results.push({
                    position,
                    wall1,
                    wall2
                });
            }
        }
        return results;
    }
    mergeRooms(roomA, roomB) {
        const eps = 0.001;
        const loopA = roomA.loop;
        const loopB = roomB.loop;
        const polyA = roomA.polygon;
        const polyB = roomB.polygon;
        if (loopA === null || polyA === null) {
            return { outcome: 'keep b', room: roomB };
        }
        if (loopB === null || polyB === null) {
            return { outcome: 'keep a', room: roomA };
        }
        const wallSetA = new Set(loopA);
        const wallSetB = new Set(loopB);
        const outsideWallsA = new Set(loopA.filter(w => !polyB.contains(w.src.pos)));
        const outsideWallsB = new Set(loopB.filter(w => !polyA.contains(w.src.pos)));
        const frontier = [...loopA];
        let intersectionCount = 0;
        const connect = (a, b) => {
            a.dst = b.src.shallowDup();
            b.src = a.dst;
        };
        const splitDepth = new Counter();
        const spliceCount = { val: 0 };
        const splice = (a0, a1, b0, b1) => {
            spliceCount.val++;
            connect(a0, b1);
            connect(b0, a1);
            if (App.debug) {
                const arrow = (w, l, c) => {
                    const offset = w.outsideNormal
                        .scale(Distance(5 * (1 + splitDepth.get(w.name)), 'screen'));
                    const tangent = w.edge.tangent;
                    const shrink = Distance(10, 'screen')
                        .min(w.length.scale(0.25));
                    const src = w.src.pos.splus(shrink, tangent).plus(offset);
                    const dst = w.dst.pos.splus(shrink.neg(), tangent).plus(offset);
                    App.ecs.createEntity().add(Arrow, src, dst, c, `${spliceCount.val}.${l}`);
                };
                arrow(a0, 'a0', 'blue');
                arrow(b1, 'b1', 'blue');
                arrow(b0, 'b0', 'red');
                arrow(a1, 'a1', 'red');
            }
        };
        const verticesOverlap = (one, two) => {
            const dEps = Distance(eps, 'screen');
            return one.some(w => two.some(v => Distances.between(w.src.pos, v.src.pos).lt(dEps)));
        };
        while (frontier.length > 0) {
            const wa = frontier.pop();
            wallSetA.add(wa);
            const ea = wa.edge;
            for (const wb of new Set(wallSetB)) {
                const eb = wb.edge;
                const hit = ea.intersection(eb);
                if (hit === null) {
                    continue;
                }
                const sa = ea.unlerp(hit);
                if (sa < eps || sa > 1 - eps)
                    continue;
                const sb = eb.unlerp(hit);
                if (sb < eps || sb > 1 - eps)
                    continue;
                const splitA = wa.splitWall(hit);
                if (splitA === null)
                    continue;
                const [wa0, wa1] = splitA;
                splitDepth.add(wa1.name, splitDepth.inc(wa0.name));
                const splitB = wb.splitWall(hit);
                if (splitB === null) {
                    // awkwardly, we have to un-split A now.
                    wa0.dst.elideJoint();
                    continue;
                }
                const [wb0, wb1] = splitB;
                splitDepth.add(wb1.name, splitDepth.inc(wb0.name));
                intersectionCount++;
                splice(wa0, wa1, wb0, wb1);
                frontier.push(wa0);
                frontier.push(wa1);
                wallSetB.add(wb0);
                wallSetB.add(wb1);
                // don't break more than one wall
                // at a time this way
                break;
            }
        }
        if (intersectionCount === 0) {
            return { outcome: 'keep both', room: roomB };
        }
        const loops = [];
        const allWalls = [...wallSetA, ...wallSetB].filter(w => w.entity.isAlive);
        const seen = new Set();
        for (const wall of allWalls) {
            if (seen.has(wall))
                continue;
            const loop = wall.getConnectedLoop();
            loop.forEach(w => seen.add(w));
            loops.push(loop);
        }
        if (loops.length === 0) {
            // how ??? should be handled by intersections = 0 above.
            roomB.entity.destroy();
            return { outcome: 'keep a', room: roomA };
        }
        if (loops.length === 1) {
            loops[0].forEach(w => roomA.addWall(w));
            roomB.entity.destroy();
            return { outcome: 'keep a', room: roomA };
        }
        let iA = -1;
        let iB = -1;
        for (let i = 0; i < loops.length; i++) {
            if (loops[i].some(w => outsideWallsA.has(w))) {
                iA = i;
                break;
            }
        }
        for (let i = 0; i < loops.length; i++) {
            if (i !== iA && loops[i].some(w => outsideWallsB.has(w))) {
                iB = i;
                break;
            }
        }
        if (iA < 0) {
            iA = iB === 0 ? 1 : 0;
        }
        if (iB < 0) {
            iB = iA === 0 ? 1 : 0;
        }
        const keepB = !verticesOverlap(loops[iA], loops[iB]);
        for (let i = 0; i < loops.length; i++) {
            if (i === iA) {
                loops[i].forEach(w => roomA.addWall(w));
            }
            else if (i === iB) {
                loops[i].forEach(w => roomB.addWall(w));
            }
            else if (verticesOverlap(loops[i], loops[iA])
                || (keepB && verticesOverlap(loops[i], loops[iB]))) {
                loops[i].forEach(w => w.entity.destroy());
            }
            else {
                const room = App.ecs.createEntity().add(Room);
                loops[i].forEach(w => room.addWall(w));
            }
        }
        if (!keepB) {
            roomB.entity.destroy();
            return { outcome: 'keep a', room: roomA };
        }
        return { outcome: 'keep both', room: roomA };
    }
    wallClosure(starting) {
        const frontier = [...starting];
        const visited = new Set();
        while (frontier.length > 0) {
            const w = frontier.pop();
            if (visited.has(w)) {
                continue;
            }
            visited.add(w);
            const src = w.src.incoming;
            const dst = w.dst.outgoing;
            if (src !== null && !visited.has(src)) {
                frontier.push(src);
            }
            if (dst !== null && !visited.has(dst)) {
                frontier.push(dst);
            }
        }
        return visited;
    }
}
App.tools.register(DrawRoomTool);
"use strict";
var _a, _b;
class RulerTool extends Tool {
    constructor() {
        super('ruler tool');
        this.hoveredPhysHandle = null;
    }
    get icon() {
        return Icons.rulerTool;
    }
    get allowSnap() {
        return true;
    }
    get cursor() {
        return `url('${Icons.rulerCursor}') 4 4, default`;
    }
    onToolSelected() {
        App.ui.clearSelection();
        App.ui.snapping.enabled = false;
    }
    setup() {
        this.events.onMouse('move', e => {
            if (App.ui.dragging)
                return;
            const handle = App.ui.getHandleAt(e.position);
            if (handle === null) {
                App.ui.clearHovered();
                App.pane.style.cursor = this.cursor;
                this.hoveredPhysHandle = null;
                return;
            }
            if (this.isRulerHandle(handle)) {
                App.ui.setHovered(handle);
                App.pane.style.cursor = 'grab';
                this.hoveredPhysHandle = null;
                return;
            }
            if (handle.entity.has(PhysEdge) || handle.entity.has(PhysNode)) {
                App.pane.style.cursor = this.cursor;
                this.hoveredPhysHandle = handle;
            }
        });
        this.events.onMouse('down', e => {
            if (App.ui.dragging)
                return;
            const handle = App.ui.getHandleAt(e.position);
            if (handle === null) {
                App.ui.clearSelection();
                return;
            }
            if (this.isRulerHandle(handle)) {
                App.ui.select(handle);
                return;
            }
        });
        this.events.addDragListener({
            onStart: (e) => {
                const handle = App.ui.getHandleAt(e.start);
                if (handle !== null && this.isRulerHandle(handle)) {
                    const events = App.ui.getDefaultDragHandler(h => this.isRulerHandle(h));
                    events.handleDrag(e);
                    return { events };
                }
                App.pane.style.cursor = this.cursor;
                const ruler = App.ecs.createEntity().add(Ruler);
                ruler.start.dragTo(e.start);
                ruler.end.dragTo(e.start.plus(e.delta));
                return { ruler };
            },
            onUpdate: (e, { ruler, events }) => {
                if (ruler) {
                    ruler.end.dragTo(e.start.plus(e.delta));
                }
                events === null || events === void 0 ? void 0 : events.handleDrag(e);
            },
            onEnd: (e, { ruler, events }) => {
                if (ruler) {
                    ruler.end.dragTo(e.start.plus(e.delta));
                }
                events === null || events === void 0 ? void 0 : events.handleDrag(e);
                if (ruler) {
                    App.ui.setSelection(ruler.entity.only(Handle));
                }
                App.pane.style.cursor = this.cursor;
            },
        });
    }
    update() {
        const handle = this.hoveredPhysHandle;
        if (handle === null || App.ui.dragging) {
            return;
        }
        if (handle.entity.has(PhysEdge)) {
            const edge = handle.entity.only(PhysEdge).edge;
            const point = edge.closestPoint(App.ui.mousePos);
            const flip = edge.normal.dot(Vectors.between(point, App.ui.mousePos)).sign;
            const offsetX = edge.tangent.to('screen').unit()
                .scale(Distance(50, 'screen').min(edge.length.scale(0.75)))
                .scale(0.5);
            const offsetY = edge.normal.to('screen').unit()
                .scale(Distance(7, 'screen')).scale(flip);
            App.canvas.setLineDash([5, 3]);
            App.canvas.lineWidth = 2;
            App.canvas.strokeStyle = BLUE;
            App.canvas.strokeLine(point.plus(offsetY).plus(offsetX), point.plus(offsetY).minus(offsetX));
            App.canvas.lineWidth = 1;
            App.canvas.setLineDash([]);
            return;
        }
        if (handle.entity.has(PhysNode)) {
            const vertex = handle.entity.only(PhysNode).pos;
            App.canvas.setLineDash([5, 3]);
            App.canvas.lineWidth = 2;
            App.canvas.strokeStyle = BLUE;
            App.canvas.strokeCircle(vertex, Distance(20, 'screen'));
            App.canvas.lineWidth = 1;
            App.canvas.setLineDash([]);
        }
    }
    isRulerHandle(handle) {
        return handle.entity.has(Ruler) || handle.entity.has(RulerEndpoint);
    }
}
App.tools.register(RulerTool);
class RulerEndpoint extends Component {
    constructor(entity, ruler) {
        super(entity);
        this.ruler = ruler;
        this[_a] = true;
        this._attachment = Refs.of({
            kind: 'canvas',
            node: entity.ecs.createEntity().add(PhysNode),
        }, areEq);
        this.position = Refs.flatMapRo(Refs.memo(this._attachment, attach => this.getAttachmentPosition(attach)), x => x);
        const handle = entity.add(Handle, {
            priority: 2,
            visible: Ruler.areRulersVisible,
            getPos: () => this.pos,
            distance: p => {
                const attach = this.attachment;
                const position = this.position.get();
                if (position === null)
                    return Distance(Number.POSITIVE_INFINITY, 'screen');
                if (attach.kind === 'vertex') {
                    return Vectors.between(p, position).mag()
                        .minus(this.handleRingRadius).abs();
                }
                if (attach.kind === 'edge') {
                    const edge = attach.node.edge;
                    const w = this.handlebarWidth;
                    const offset = this.handlebarOffset;
                    return new SpaceEdge(position.splus(w.scale(0.5), edge.tangent).plus(offset), position.splus(w.scale(-0.5), edge.tangent).plus(offset)).distance(p);
                }
                if (attach.kind === 'canvas') {
                    const edge = this.ruler.edge;
                    const w = this.handlebarWidth;
                    return new SpaceEdge(position.splus(w.scale(0.5), edge.normal), position.splus(w.scale(-0.5), edge.normal)).distance(p);
                }
                return impossible(attach);
            },
            drag: () => ({
                kind: 'point',
                name: this.name,
                get: () => this.pos,
                set: p => this.dragTo(p),
            }),
            onDelete: () => {
                this.ruler.entity.destroy();
                this.twin.entity.destroy();
                this.entity.destroy();
                return 'kill';
            },
        });
        handle.events.onMouse('down', e => {
            this.ruler.entity.only(Handle).selected = true;
        });
        handle.events.onMouse('move', e => {
            this.ruler.entity.only(Handle).hovered = true;
        });
    }
    get twin() {
        return this.ruler.start === this ? this.ruler.end : this.ruler.start;
    }
    get pos() {
        return this.position.get();
    }
    addForce(force) {
        const attach = this.attachment;
        if (attach.kind !== 'canvas' && this.twin.attachment.kind === 'canvas') {
            this.twin.addForce(force.neg());
            return;
        }
        attach.node.addForce(force);
    }
    get handlebarOffset() {
        if (this.attachment.kind !== 'edge') {
            return Vector(Vec.ZERO, 'screen');
        }
        const rulerMidpoint = this.ruler.edge.midpoint;
        const other = this.attachment.node.edge;
        const flip = other.normal.dot(Vectors.between(this.pos, rulerMidpoint)).sign;
        return other.normal.scale(flip).scale(Distance(7, 'screen'));
    }
    get handleRingRadius() {
        return Distance(20, 'screen');
    }
    get handlebarWidth() {
        const edge = this.ruler.edge;
        const handlebarWidth = Distance(100, 'screen').to('model')
            .min(edge.length.scale(0.3));
        if (this.attachment.kind === 'edge') {
            const other = this.attachment.node.edge;
            if (other !== null) {
                return handlebarWidth.min(other.length.scale(0.75));
            }
        }
        return handlebarWidth;
    }
    dragTo(pos) {
        // this is different from just a straightforward set pos = p,
        // because we might attach to a wall something.
        var _c, _d, _e, _f;
        const filter = (handle) => (!handle.entity.has(RulerEndpoint) && !handle.entity.has(Ruler));
        const vertex = (_d = (_c = App.ui.getHandleAt(pos, handle => filter(handle) && handle.entity.has(PhysNode))) === null || _c === void 0 ? void 0 : _c.entity) === null || _d === void 0 ? void 0 : _d.only(PhysNode);
        if (vertex) {
            this.attachment = {
                kind: 'vertex',
                node: vertex,
            };
            return;
        }
        const edge = (_f = (_e = App.ui.getHandleAt(pos, handle => filter(handle) && handle.entity.has(PhysEdge))) === null || _e === void 0 ? void 0 : _e.entity) === null || _f === void 0 ? void 0 : _f.only(PhysEdge);
        if (edge) {
            const node = edge;
            if (this.twin.isAnchored) {
                this.attachment = { kind: 'edge', node };
                return;
            }
            this.attachment = {
                kind: 'edge',
                node,
                at: clamp01(node.edge.unlerp(pos)),
            };
            return;
        }
        const existing = this.attachment;
        if (existing.kind === 'canvas') {
            existing.node.pos = pos;
            return;
        }
        const node = this.entity.ecs.createEntity().add(PhysNode);
        node.pos = pos;
        this.attachment = {
            kind: 'canvas',
            node,
        };
    }
    isAttachedTo(e) {
        return e == this.attachment.node.entity;
    }
    getAttachmentPosition(attach) {
        if (attach.kind === 'canvas' || attach.kind === 'vertex') {
            return Refs.ro(attach.node.position);
        }
        if (attach.kind === 'edge') {
            return attach.node.edgeRef.map(edge => {
                if (typeof attach.at !== 'undefined') {
                    return edge.lerp(attach.at);
                }
                const twin = this.twin;
                if (twin.attachment.kind === 'edge') {
                    const twinEdge = twin.attachment.node.edge;
                    if (typeof twin.attachment.at === 'undefined'
                        || !twin.attachment.node.entity.isAlive) {
                        // give up and use our midpoint.
                        return edge.midpoint;
                    }
                    //const ray = new SpaceRay(twinEdge.lerp(twin.attachment.at), twinEdge.normal);
                    //const hit = ray.intersection(edge);
                    //if (hit === null) return edge.midpoint;
                    //const at = clamp01(edge.unlerp(hit.point));
                    //return edge.lerp(at);
                    return edge.closestPoint(twinEdge.lerp(twin.attachment.at));
                }
                if (twin.attachment.kind === 'vertex' || twin.attachment.kind === 'canvas') {
                    const position = twin.attachment.node.pos;
                    if (position !== null) {
                        return edge.closestPoint(position);
                    }
                    return position !== null ? position : edge.midpoint;
                }
                return impossible(twin.attachment);
            });
        }
        return impossible(attach);
    }
    get isAnchored() {
        const attach = this.attachment;
        if (attach.kind === 'canvas') {
            return false;
        }
        if (attach.kind === 'vertex') {
            return true;
        }
        if (attach.kind === 'edge') {
            return typeof attach.at !== 'undefined';
        }
        return impossible(attach);
    }
    get attachment() {
        return this._attachment.get();
    }
    set attachment(attach) {
        if (this.attachment === attach) {
            return;
        }
        const prev = this.attachment;
        this._attachment.set(attach);
        if (prev.kind === 'canvas') {
            prev.node.entity.destroy();
        }
    }
    tearDown() {
        if (this.attachment.kind === 'canvas') {
            this.attachment.node.entity.destroy();
        }
    }
}
_a = SOLO;
ComponentFactories.register(RulerEndpoint, (entity) => 'skip');
class Ruler extends Component {
    constructor(entity) {
        super(entity);
        this[_b] = true;
        this.start = entity.ecs.createEntity().add(RulerEndpoint, this);
        this.end = entity.ecs.createEntity().add(RulerEndpoint, this);
        this.phys = entity.add(PhysEdge, Refs.ofRo(this.start), Refs.ofRo(this.end));
        entity.add(LengthConstraint);
        const handle = entity.add(Handle, {
            getPos: () => this.phys.edge.midpoint,
            distance: p => this.phys.edge.distanceFrom(p),
            visible: Ruler.areRulersVisible,
            drag: () => ({
                kind: 'group',
                aggregate: 'all',
                name: this.name,
                items: [this.start, this.end].map(e => e.entity.only(Handle).getDragItem()),
            }),
        });
        handle.events.addDragListener({
            onStart: e => {
                const edge = this.phys.edge;
                const start = this.start;
                const end = this.end;
                return {
                    start,
                    end,
                    srcDelta: Vectors.between(e.start, edge.src),
                    dstDelta: Vectors.between(e.start, edge.dst),
                };
            },
            onUpdate: (e, { start, end, srcDelta, dstDelta }) => {
                const pos = e.start.plus(e.delta);
                start.dragTo(pos.plus(srcDelta));
                end.dragTo(pos.plus(dstDelta));
            },
            onEnd: (e, nodes) => {
            },
        });
    }
    get edge() {
        return this.phys.edge;
    }
    toJson() {
        const attach = (end) => {
            const attach = end.attachment;
            if (attach.kind === 'canvas') {
                return {
                    kind: attach.kind,
                    position: MoreJson.position.to(attach.node.pos),
                };
            }
            if (attach.kind === 'vertex') {
                return {
                    kind: attach.kind,
                    node: attach.node.entity.id,
                };
            }
            if (attach.kind === 'edge') {
                return {
                    kind: attach.kind,
                    edge: attach.node.entity.id,
                    at: typeof attach.at !== 'undefined' ? attach.at : false,
                };
            }
            return impossible(attach);
        };
        return {
            factory: this.constructor.name,
            arguments: [attach(this.start), attach(this.end)],
        };
    }
    tearDown() {
        this.start.entity.destroy();
        this.end.entity.destroy();
    }
}
_b = SOLO;
Ruler.areRulersVisible = () => {
    return App.tools.current.name === 'ruler tool' || App.settings.showLengths.get();
};
ComponentFactories.register(Ruler, (entity, startJson, endJson) => {
    const ruler = entity.getOrCreate(Ruler);
    const load = (end, a) => {
        var _c, _d, _e;
        const kind = a.kind;
        if (kind === 'canvas') {
            const pos = MoreJson.position.from(a.position);
            end.dragTo(pos);
            return true;
        }
        if (kind === 'vertex') {
            const v = (_c = entity.ecs.getEntity(a.node)) === null || _c === void 0 ? void 0 : _c.maybe(PhysNode);
            if (!v)
                return false;
            end.dragTo(v.pos);
            return true;
        }
        if (kind === 'edge') {
            const edge = (_e = (_d = entity.ecs.getEntity(a.edge)) === null || _d === void 0 ? void 0 : _d.maybe(PhysEdge)) === null || _e === void 0 ? void 0 : _e.edge;
            if (!edge || edge.length.get('model') === 0)
                return false;
            if (a.at === false) {
                end.dragTo(edge.midpoint);
                return true;
            }
            end.dragTo(edge.lerp(a.at));
            return true;
        }
        throw new Error(`unrecognized ruler endpoint kind: '${kind}'`);
    };
    const start = ruler.start;
    const end = ruler.end;
    if (start !== null && !load(start, startJson)) {
        return 'not ready';
    }
    if (end !== null && !load(end, endJson)) {
        return 'not ready';
    }
    return ruler;
});
const RulerRenderer = (ecs) => {
    var _c;
    if (!Ruler.areRulersVisible())
        return;
    for (const ruler of ecs.getComponents(Ruler)) {
        if (!ruler.start.attachment.node.entity.isAlive
            || !ruler.end.attachment.node.entity.isAlive) {
            ruler.entity.destroy();
            continue;
        }
        const edge = ruler.edge;
        const rulerActive = (_c = ruler.entity.maybe(Handle)) === null || _c === void 0 ? void 0 : _c.isActive;
        const distance = edge.length.get('model');
        const constraint = ruler.entity.only(LengthConstraint);
        const label = constraint.label;
        App.canvas.text({
            text: label.text,
            fill: rulerActive ? 'black' : 'grey',
            point: edge.midpoint,
            align: 'center',
            baseline: 'middle',
            shadow: label.status !== 'satisfied' ? PINK : undefined,
        });
        const primaryColor = BLUE;
        const fontSize = App.settings.fontSize;
        const labelGap = Distance(fontSize, 'screen').to('model');
        const endpointGap = Distance(14, 'screen').to('model');
        App.canvas.lineWidth = rulerActive ? 2 : 1;
        App.canvas.strokeStyle = rulerActive ? primaryColor : 'gray';
        App.canvas.setLineDash(constraint.enabled ? [] : [5, 3]);
        App.canvas.strokeLine(edge.src.splus(endpointGap, edge.tangent), edge.midpoint.splus(labelGap, edge.tangent.neg()));
        App.canvas.strokeLine(edge.dst.splus(endpointGap, edge.tangent.neg()), edge.midpoint.splus(labelGap, edge.tangent));
        const renderEndpoint = (endpoint) => {
            const endpointActive = rulerActive || endpoint.entity.ref(r => r.only(Handle))
                .map(h => h.isActive)
                .or(false);
            App.canvas.strokeStyle = endpointActive ? primaryColor : 'gray';
            const handlebarWidth = endpoint.handlebarWidth;
            const position = endpoint.position.get();
            const attachment = endpoint.attachment;
            if (attachment.kind === 'canvas') {
                App.canvas.strokeLine(position.splus(handlebarWidth.div(2), edge.normal), position.splus(handlebarWidth.div(2), edge.normal.neg()));
                return;
            }
            if (attachment.kind === 'edge') {
                const other = attachment.node.edge;
                const inward = other.normal.dot(Vectors.between(position, edge.midpoint)).sign < 0
                    ? other.normal.neg() : other.normal;
                const offset1 = inward.scale(endpointGap.scale(0.5));
                const offset2 = inward.scale(endpointGap.scale(0.5).plus(Distance(3, 'screen')));
                App.canvas.setLineDash([]);
                App.canvas.strokeLine(position.splus(handlebarWidth.div(2), other.tangent).plus(offset1), position.splus(handlebarWidth.div(2), other.tangent.neg()).plus(offset1));
                App.canvas.strokeLine(position.splus(handlebarWidth.div(2.5), other.tangent).plus(offset2), position.splus(handlebarWidth.div(2.5), other.tangent.neg()).plus(offset2));
                return;
            }
            if (attachment.kind === 'vertex') {
                App.canvas.strokeCircle(position, endpoint.handleRingRadius);
                return;
            }
            return impossible(attachment);
        };
        renderEndpoint(ruler.start);
        renderEndpoint(ruler.end);
        App.canvas.setLineDash([]);
    }
};
