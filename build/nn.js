var nnjs = {};

// Utility fun
function assert(condition, message) {
    // from http://stackoverflow.com/questions/15313418/javascript-assert
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}

(function() {"use strict";
    var hasOwn = Object.prototype.hasOwnProperty;
    var toStr = Object.prototype.toString;

    var isArray = function isArray(arr) {
        if (typeof Array.isArray === 'function') {
            return Array.isArray(arr);
        }

        return toStr.call(arr) === '[object Array]';
    };

    var isPlainObject = function isPlainObject(obj) {
        if (!obj || toStr.call(obj) !== '[object Object]') {
            return false;
        }

        var hasOwnConstructor = hasOwn.call(obj, 'constructor');
        var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
        // Not own constructor property must be Object
        if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
            return false;
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.
        var key;
        for (key in obj) { /**/ }

        return typeof key === 'undefined' || hasOwn.call(obj, key);
    };

    function extend() {
        var options, name, src, copy, copyIsArray, clone;
        var target = arguments[0];
        var i = 1;
        var length = arguments.length;
        var deep = false;

        // Handle a deep copy situation
        if (typeof target === 'boolean') {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        } else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
            target = {};
        }

        for (; i < length; ++i) {
            options = arguments[i];
            // Only deal with non-null/undefined values
            if (options != null) {
                // Extend the base object
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    // Prevent never-ending loop
                    if (target !== copy) {
                        // Recurse if we're merging plain objects or arrays
                        if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
                            if (copyIsArray) {
                                copyIsArray = false;
                                clone = src && isArray(src) ? src : [];
                            } else {
                                clone = src && isPlainObject(src) ? src : {};
                            }

                            // Never move original objects, clone them
                            target[name] = extend(deep, clone, copy);

                            // Don't bring in undefined values
                        } else if (typeof copy !== 'undefined') {
                            target[name] = copy;
                        }
                    }
                }
            }
        }

        // Return the modified object
        return target;
    };

    Object.extend = extend;
})();

(function(lib) {
    "use strict";
    var math = {
        gauss_: { a: false, b: 0.0 },
        gauss: function() {
            if (math.gauss_.a) { math.gauss_.a = false;
                return math.gauss_.b; }
            var u = 2 * Math.random() - 1;
            var v = 2 * Math.random() - 1;
            var r = u * u + v * v;
            if (r == 0 || r > 1) return math.gauss();
            var c = Math.sqrt(-2 * Math.log(r) / r);
            math.gauss_.b = v * c; // cache this
            math.gauss_.a = true;
            return u * c;
        },

        randf: function(a, b) {
            return Math.random() * (b - a) + a;
        },

        randi: function(a, b) {
            return Math.floor(Math.random() * (b - a) + a);
        },

        randn: function(mu, std) {
            return mu + math.gauss() * std;
        },

        tanh: typeof Math.tanh === "undefined" ? function(x) {
            var y = Math.exp(2 * x);
            return (y - 1) / (y + 1); } : Math.tanh
    };

    //
    //
    //
    function Size2(x, y) {
        return { x: x, y: y, length: x * y };
    };

    function Size3(x, y, z) {
        return { x: x, y: y, depth: z, length: x * y * z };
    };


    //
    //
    //
    function Mat(x, y, z, v) {
        this.size = lib.Size3(x, y, z);
        this.d = Mat.CreateArray(x * y * z, v === undefined ? 0.0 : v, 'Float64Array');
    };

    Mat.CreateArray = function(length, v, t) {
        var arr = null;

        v = v || 0;
        t = t || 'Float64Array';

        if (typeof ArrayBuffer === 'undefined') {
            arr = new Array(length);
        } else {
            arr = eval('new ' + t + '(length)');
        }

        for (var i = 0; i < length; ++i) { arr[i] = v; }
        return arr;
    };

    Mat.copy = function(mat) {
        var mat_ = new mat(mat.size.x, mat.size.y, mat.size.depth);
        for (var i = 0; i < mat.d.length; i++) { mat_.d[i] = mat.d[i]; }
        return mat_;
    };

    Mat.prototype.maxi = function() {
        for (var i = 0, j = 0, m = -Infinity; i < this.d.length; i++) {
            if (this.d[i] > m) {
                j = i, m = this.d[i];
            }
        }

        return j;
    };

    Mat.prototype.get = function(x, y, z) {
        return this.d[(y * this.size.x + x) * this.size.depth + z];
    };

    Mat.prototype.set = function(x, y, z, v) {
        this.d[(y * this.size.x + x) * this.size.depth + z] = v;
    };

    Mat.prototype.add = function(x, y, z, v) {
        this.d[(y * this.size.x + x) * this.size.depth + z] += v;
    };

    Mat.prototype.all = function(v) {
        for (var i = 0; i < this.d.length; i++) { this.d[i] = v; }
    };

    Mat.prototype.copy = function(a, s, b) {
        if (s === undefined) s = 1;
        for (var i = 0; i < this.d.length; i++) { this.d[i] = a[i] / s + b; }
    };

    Mat.prototype.write = function(a) {
        for (var i = 0; i < this.d.length; i++) { this.d[i] = a.d[i]; }
    };

    Mat.prototype.randf = function(a, b) {
        for (var i = 0; i < this.d.length; i++) { this.d[i] = math.randf(a, b); }
    };

    Mat.prototype.randn = function(scale) {
        scale = scale || Math.sqrt(1.0 / (this.size.x * this.size.y * this.size.depth));
        for (var i = 0; i < this.d.length; i++) { this.d[i] = math.randn(0.0, scale); }
    };

    Mat.prototype.clone = function() {
        return mat.copy(this);
    };

    // accessor
    // [ (y * this.size.x + x) * this.size.depth + z ]


    function Blob(x, y, z, a, b) {
        this.size = lib.Size3(x, y, z);
        this.w = new Mat(x, y, z);
        this.dw = new Mat(x, y, z);

        if (a !== undefined && b !== undefined) {
            this.w.randf(a, b);
        } else {
            this.w.randn();
        }

    };

    lib.MathU = math;
    lib.Size2 = Size2;
    lib.Size3 = Size3;
    lib.Mat = Mat;
    lib.Blob = Blob;

})(nnjs);

(function (lib) { "use strict";

    /**
     * Helper function, that converts a description into an actual layer object
     * @param {object} description
     */
    function Layer(opt, net) {
        switch (opt.type) {
            case 'input': return new lib.InputLayer(opt, net);
            case 'dot': return new lib.DotLayer(opt, net);
            case 'conv': return new lib.ConvolutionalLayer(opt, net);
            case 'lstm': return new lib.LongShortTermMemoryLayer(opt, net);
            case 'pool': return new lib.PoolingLayer(opt, net);
            case 'sigmoid': return new lib.SigmoidLayer(opt, net);
            case 'relu': return new lib.ReluLayer(opt, net);
            case 'tanh': return new lib.TanhLayer(opt, net);
            case 'dropout': return new lib.DropOutLayer(opt, net);
            case 'softmax': return new lib.SoftmaxLayer(opt, net);
            case 'hsm': return new lib.HierarchicalSoftmax(opt, net);
            case 'regression': return new lib.RegressionLayer(opt, net);
        }
    }

    function NetworkStructure(desc, net) {
        this.net = net;
        this.description = desc;
        this.length = desc.length; // convienience
        this.recurrent = false;

        this.Build();
    };

    NetworkStructure.prototype.Build = function () {
        this.list = [];
        for (var i = 0; i < this.description.length; i++) {
            if (i > 0) {
                this.description[i].input = this.list[i - 1].out; // set input to this layer to the output of last layer
            }

            this.list[i] = Layer(this.description[i], this.net);

            if (this.list[i].recurrent) {
                this.recurrent = true;
            }
        }
    };  

    NetworkStructure.prototype.stats = function () {
        var stats = { parameters: 0 };

        for (var i = 0; i < this.length; i++) {
            if (this.list[i].parameters === undefined) continue;

            for (var j = 0; j < this.list[i].parameters.filters.length; j++) {
                stats.parameters += this.list[i].parameters.filters[j].size.length;
            }

            stats.parameters += this.list[i].parameters.biases.size.length;
        }

        return stats;
    };

    NetworkStructure.prototype.parameters = function () {
        var parameters = [];

        for (var i = 0; i < this.length; i++) {
            if (this.list[i].parameters === undefined) continue;

            var object = { filters: [], biases: this.list[i].parameters.biases.w.d };
            for (var j = 0; j < this.list[i].parameters.filters.length; j++) {
                object.filters[j] = this.list[i].parameters.filters[j].w.d;
            }

            parameters[i] = object;
        }

        return parameters;
    };

    NetworkStructure.prototype.at = function (i) {
        i = i >= 0 ? i : this.length + i;
        return this.list[i];
    };

    // current state
    function NetworkState(net) {
        this.net = net;
        this.layers = net.layers;
        this.width = net.layers.length; // how many layers?
        this.height = this.layers.recurrent ? this.net.learner.timespan : 1; // how long bptt? / time steps
        
        if (this.layers.recurrent) {
            this.blobs = this.Build(this.net.learner.timespan + 1); // last one needs reference to previous
        } else {
            this.blobs = this.Build(1); // only one time needed
        }
    };

    // [ [ state for T=0 ], [ state for T=1 ], ... ]
    NetworkState.prototype.Build = function (h, S) {
        var T = [];
        for (var t = 0; t < h; t++) {
            T.unshift(this.BuildState(T, S !== undefined ? S[t] : undefined));
        }

        return T;
    };

    // [ [ Blob for layer 1 ], [ Blob for layer 2 ], ... ]
    NetworkState.prototype.BuildState = function (T, S) {
        S = S || [];

        for (var i = 0; i < this.layers.length; i++) {
            if (typeof this.layers.list[i].out !== 'undefined' && S[i] === undefined) {
                S[i] = new lib.Blob(this.layers.list[i].out.x, this.layers.list[i].out.y, this.layers.list[i].out.depth, 0.0);
            } else if (S[i] === undefined) {
                S[i] = {};
            } else {
                S[i].w.all(0), S[i].dw.all(0);
            }

            if (typeof this.layers.list[i].recurrent !== 'undefined' && this.layers.list[i].recurrent
                    && T !== undefined && T.length > 0) {
                S[i].prev = T[0][i];
            }

            if (typeof this.layers.list[i].PrepareStateBlob !== 'undefined') {
                this.layers.list[i].PrepareStateBlob(S[i]);
            }
        }

        return S;
    };

    NetworkState.prototype.reset = function () {
        this.blobs = this.Build(this.blobs.length, this.blobs);
    };

    NetworkState.prototype.next = function () {
        if (this.layers.recurrent) { // only if recurrent
            var S = this.blobs.pop();
            this.blobs.unshift(this.BuildState(this.blobs, S)); // reusability
            for (var i = 0; i < this.width.length; i++) { 
                if (this.blobs[this.height][i].prev)
                    this.blobs[this.height][i].prev = null; 
            }
        }

        // clean gradients
        for (var t = 0; t < this.blobs.length; t++) {
            for (var i = 0; i < this.width; i++) {
                this.blobs[t][i].dw.all(0.0);
            }
        }
    };

    NetworkState.prototype.at = function (i, t) {
        t = t || 0;
        t = t >= 0 ? t : this.height + t;

        i = i || 0;
        i = i >= 0 ? i : this.width + i;

        return this.blobs[t][i];
    };

    /**
     * @param {object}
     */
    function Network(opt) {
        this.learner = opt.learner;
        this.learner = Object.extend(true, {
            method: 'sgd',
            batch: 1,
            decay: { l1: 0, l2: 0 },
            clip: Infinity,
            timespan: 1 // only for rnn
        }, this.learner);

        this.learner = Object.extend(true, this.gd[this.learner.method].defaults, this.learner);
        this.weak = true; // dropout enabled?
        this.pass = 0;

        this.layers = new NetworkStructure(opt.layers, this);
        this.state = new NetworkState(this); // exchangable
    };

    Network.prototype.forward = function(inp) {
        // go forwards through network
        this.state.next();
        var y = this.layers.list[0].forward(inp, this.state.at(0));
        for (var i = 1; i < this.layers.length; ++i) {
            y = this.layers.list[i].forward(this.state.at(i - 1), this.state.at(i));
        }

        return y !== undefined ? y : this.state.at(-1).w.d;
    };

    Network.prototype.backward = function(outp) {
        var E = false, I = this.layers.length - 2;

        var loss = this.layers.at(-1).backward(this.state.at(-1), this.state.at(-2), outp);
        for (var t = 0; t < this.state.height && (E || t === 0); t++) {
            for (var i = I; i >= 0; i--) { // always start backward pass at last recurrent layer, or at second-last layer if t=0

                if(!E && this.layers.list[i].recurrent) { // expand network
                    E = true, I = i;
                }

                this.layers.list[i].backward(this.state.at(i, t), this.state.at(i - 1, t));

            }  
        }

        this.adjust();
        
        return loss;
    };

    Network.prototype.adjust = function() {
        if (++this.pass % this.learner.batch !== 0) {
            return;
        }

        var method = this.gd[this.learner.method];
        for (var i = 0; i < this.layers.length; i++) {
            if (typeof this.layers.list[i].parameters === 'undefined')
                continue;

            var param = this.layers.list[i].parameters;
            if (typeof param.filters !== 'undefined') {
                for (var j = 0; j < param.filters.length; j++) { method.call(this, this.learner, param.filters[j], 1.0); }
            }

            if (typeof param.biases !== 'undefined') {
                method.call(this, this.learner, param.biases, 0.0);
            }
        }
    };

    /* gradient descent algorithms */
    Network.prototype.gd = {};

    Network.prototype.gd.sgd = {
        defaults: {
            rate: 0.01,
            momentum: 0.9
        },
        storage: ['gsum'],
        algorithm: function() {
            dx = opt.momentum * gsum - opt.rate * gij;
            gsum = dx;
        }
    };

    Network.prototype.gd.adadelta = {
        defaults: {
            ro: 0.95,
            eps: 1e-8
        },
        storage: ['gsum', 'xsum'],
        algorithm: function() {
            gsum = opt.ro * gsum + (1 - opt.ro) * gij * gij;
            dx = -Math.sqrt((xsum + opt.eps) / (gsum + opt.eps)) * gij;
            xsum = opt.ro * xsum + (1 - opt.ro) * dx * dx; // yes, xsum lags behind gsum by 1.
        }
    };

    /* algorithms compiler, speeds things up, and makes things easier */
    (function() {
        var gd_prototype = function(opt, O, decay) {
            if (O.nochange) return;
            var dx = 0, __grad = 0, gij = 0, l1grad = 0, l2grad = 0;
            "UU1";
            for (var i = 0; i < O.size.length; i++) {
                __grad = O.dw.d[i];
                __grad = __grad > opt.clip ? opt.clip : (__grad < -opt.clip ? -opt.clip : __grad);
                l1grad = decay * opt.decay.l1 * (O.w.d[i] > 0 ? 1 : -1);
                l2grad = decay * opt.decay.l2 * (O.w.d[i]);
                gij = (__grad + l1grad + l2grad) / opt.batch;
                "UU2";
                "UU3";
                "UU4";
                O.w.d[i] += dx;
            }

            O.dw.all(0.0);
        };

        var gd_prototype_ = gd_prototype.toString();

        for (var name in Network.prototype.gd) {
            var description = Network.prototype.gd[name];
            var checks = [];
            for (var i = 0; i < description.storage.length; i++) {
                checks[i] = 'if (typeof O.' + description.storage[i] + ' === "undefined") { O.' + description.storage[i] + ' = new lib.Mat(O.size.x, O.size.y, O.size.depth, 0.0); }';
            }

            var extractions = [];
            for (var i = 0; i < description.storage.length; i++) {
                extractions[i] = 'var ' + description.storage[i] + ' = O.' + description.storage[i] + '.d[i];';
            }

            var alg = description.algorithm.toString();
            alg = alg.substring(alg.indexOf('{') + 1, alg.length - 1);

            var storings = [];
            for (var i = 0; i < description.storage.length; i++) {
                storings[i] = 'O.' + description.storage[i] + '.d[i] = ' + description.storage[i] + ';';
            }

            var func = gd_prototype_.replace('"UU1";', checks.join("")).replace('"UU2";', extractions.join("")).replace('"UU3";', alg).replace('"UU4";', storings.join(""));
            var cmd = 'Network.prototype.gd.' + name + ' = ' + func;
            eval(cmd);
            Network.prototype.gd[name].defaults = description.defaults;
        }
    })();

    lib.Network = Network;
})(nnjs);

(function (lib) { "use strict";

	/* spatial weights */
	function ConvolutionalLayer(opt) {
		this.in = opt.input;
		this.filter = opt.filter;
		this.stride = opt.stride;
		this.pad = opt.pad;

		var ox = Math.floor((this.in.x + this.pad * 2 - this.filter.x) / this.stride + 1);
		var oy = Math.floor((this.in.y + this.pad * 2 - this.filter.y) / this.stride + 1);
		this.out = lib.Size3(ox, oy, this.filter.depth);

		this.parameters = {
			filters: [],
			biases: new lib.Blob(1, 1, this.filter.depth, 0.0)
		};

		for (var i = 0; i < this.out.depth; i++) {
			this.parameters.filters[i] = new lib.Blob(this.filter.x, this.filter.y, this.in.depth);
		}
	};

	ConvolutionalLayer.prototype.forward = function (V, A) {
		var A_x = A.size.x | 0, A_y = A.size.y | 0, A_d = A.size.depth | 0;
		var V_x = V.size.x | 0, V_y = V.size.y | 0, V_d = V.size.depth | 0;
		var F_x = this.filter.x | 0, F_y = this.filter.y | 0, F_d = this.filter.depth | 0;

		var stride = this.stride | 0;
		var biases = this.parameters.biases.w.d;

		for (var d = 0; d < A_d; d++) {
		    var f = this.parameters.filters[d];
		    var x = -this.pad | 0;
		    var y = -this.pad | 0;
		    for (var ay = 0; ay < A_y; y += stride, ay++) { // xy_stride
		        x = -this.pad | 0;
		        for (var ax = 0; ax < A_x; x += stride, ax++) { // xy_stride

		            // convolve centered at this particular location [ax, ay]
		            var a = 0.0;
		            var ox = 0, oy = 0;
		            for (var fy = 0; fy < F_y; fy++) {
		                oy = y + fy; // coordinates in the original input array coordinates
		                for (var fx = 0; fx < F_x; fx++) {
		                    ox = x + fx;
		                    if (oy >= 0 && oy < V_y && ox >= 0 && ox < V_x) {
		                        for (var fd = 0; fd < F_d; fd++) {
		                            // A.w[ax, ay, d] += f.w[ fx, fy, fd ] * V.w[ ox, oy, fd ]
		                            a += f.w.d[(fy * F_x + fx) * F_d + fd] * V.w.d[(oy * V_x + ox) * V_d + fd];
		                        }
		                    }
		                }
		            }

		            A.w.d[(ay * A_x + ax) * A_d + d] = a + biases[d];
		        }
		    }
		}
	};

	ConvolutionalLayer.prototype.backward = function (A, V) {
		var A_x = A.size.x | 0, A_y = A.size.y | 0, A_d = A.size.depth | 0;
		var V_x = V.size.x | 0, V_y = V.size.y | 0, V_d = V.size.depth | 0;
		var F_x = this.filter.x | 0, F_y = this.filter.y | 0, F_d = this.filter.depth | 0;

		var stride = this.stride | 0;
		var biases = this.parameters.biases.dw.d;

		var v1 = 0, v2 = 0;

		for (var d = 0; d < A_d; d++) {
		    var f = this.parameters.filters[d];
		    var x = -this.pad | 0;
		    var y = -this.pad | 0;
		    for (var ay = 0; ay < A_y; y += stride, ay++) {
		        x = -this.pad | 0;
		        for (var ax = 0; ax < A_x; x += stride, ax++) {

		            // convolve centered at this location [ax, ay]
		            var dA = A.dw.d[(ay * A_x + ax) * A_d + d];
		            var ox = 0, oy = 0;
		            for (var fy = 0; fy < F_y; fy++) {
		                oy = y + fy; // coordinates in the original input array coordinates
		                for (var fx = 0; fx < F_x; fx++) {
		                    ox = x + fx;
		                    if (oy >= 0 && oy < V_y && ox >= 0 && ox < V_x) {
		                        for (var fd = 0; fd < F_d; fd++) {
		                            // f.dw[fx, fy, fd] += V.w[ox, oy, fd] * A.dw[ax, ay, d]
									// V.dw[ox, oy, fd] += f.w[fx, fy, fd] * A.dw[ax, ay, d]
		                            v1 = (fy * F_x + fx) * F_d + fd;
		                            v2 = (oy * V_x + ox) * V_d + fd;
		                            f.dw.d[v1] += V.w.d[v2]*dA;
	                    			V.dw.d[v2] += f.w.d[v1]*dA;
		                        }
		                    }
		                }
		            }

		            biases[d] += dA;
		        }
		    }
		}
	};

	/* Pooling layer, select biggest value from convolution */
	function PoolingLayer(opt) {
		this.in = opt.input;
		this.filter = opt.filter;
		this.stride = opt.stride;
		this.pad = opt.pad;

		var ox = Math.floor((this.in.x + this.pad * 2 - this.filter.x) / this.stride + 1);
		var oy = Math.floor((this.in.y + this.pad * 2 - this.filter.y) / this.stride + 1);
		this.out = lib.Size3(ox, oy, this.in.depth);
	};

	PoolingLayer.prototype.forward = function (V, A) {
		var A_x = A.size.x | 0, A_y = A.size.y | 0, A_d = A.size.depth | 0;
		var V_x = V.size.x | 0, V_y = V.size.y | 0, V_d = V.size.depth | 0;
		var F_x = this.filter.x | 0, F_y = this.filter.y | 0; 

		var stride = this.stride | 0;

		for (var d = 0; d < A_d; d++) {
		    var x = -this.pad | 0;
		    var y = -this.pad | 0;
		    for (var ay = 0; ay < A_y; y += stride, ay++) {
		        x = -this.pad | 0;
		        for (var ax = 0; ax < A_x; x += stride, ax++) {

		            // convolve centered at this location [ax, ay]
		            var selv = -Math.Infinity, selx = 0, sely;
		            var ox = 0, oy = 0, q = 0;
		            for (var fy = 0; fy < F_y; fy++) {
		                oy = y + fy; // coordinates in the original input array coordinates
		                for (var fx = 0; fx < F_x; fx++) {
		                    ox = x + fx;
		                    if (oy >= 0 && oy < V_y && ox >= 0 && ox < V_x) {
		                    	q = V.w.d[(oy * V_x + ox) * V_d + d];
		                    	if (q > selv) { selv = q; selx = ox; sely = oy; }
		                    }
		                }
		            }

		            var ix = (ay * A_x + ax) * A_d + d;
		            A.px[ix] = selx;
		            A.py[ix] = sely;
		            A.w.d[ix] = selv;
		        }
		    }
		}
	};

	PoolingLayer.prototype.backward = function (A, V) {
		var A_x = A.size.x | 0, A_y = A.size.y | 0, A_d = A.size.depth | 0;
		var V_x = V.size.x | 0, V_y = V.size.y | 0, V_d = V.size.depth | 0;
		var F_x = this.filter.x | 0, F_y = this.filter.y | 0; 

		var stride = this.stride | 0;

		for (var d = 0; d < A_d; d++) {
		    for (var ay = 0; ay < A_y; ay++) {
		        for (var ax = 0; ax < A_x; ax++) {
		        	var ix = (ay * A_x + ax) * A_d + d;
		        	var dA = A.dw.d[ix];

		        	var selx = A.px[ix]; 
		        	var sely = A.py[ix];

		        	V.dw.d[(sely * V_x + selx) * V_d + d] = dA; // only transfer weights from selected locations
		        }
		    }
		}
	};

	PoolingLayer.prototype.PrepareStateBlob = function (A) {
		A.px = lib.Mat.CreateArray(this.out.depth * this.out.y * this.out.x, 0, 'Uint16Array');
		A.py = lib.Mat.CreateArray(this.out.depth * this.out.y * this.out.x, 0, 'Uint16Array');
	};

	lib.ConvolutionalLayer = ConvolutionalLayer;
	lib.PoolingLayer = PoolingLayer;
})(nnjs);
(function (lib) { "use strict";
	/**
	 * @param {object} input, size
	 */
	function DotLayer(opt) {
		this.in = opt.input;
		this.out = lib.Size3(1, 1, opt.size);
		this.parameters = {
			filters: [],
			biases: new lib.Blob(1, 1, this.out.depth, 0.0)
		};

		for (var i = 0; i < this.out.length; i++) {
			this.parameters.filters[i] = new lib.Blob(1, 1, this.in.length);
		}
	};

	DotLayer.prototype.forward = function (V, A) {
		for (var i = 0; i < this.out.length; i++) {
			var sum = 0.0;
			for (var j = 0; j < this.in.length; j++) {
				sum += V.w.d[j] * this.parameters.filters[i].w.d[j];
			}

			A.w.d[i] = sum + this.parameters.biases.w.d[i];
		}
	};

	DotLayer.prototype.backward = function (A, V) {
		for (var i = 0; i < this.out.length; i++) {
			var dA = A.dw.d[i];
			for (var j = 0; j < this.in.length; j++) {
				this.parameters.filters[i].dw.d[j] += V.w.d[j] * dA;
				V.dw.d[j] += this.parameters.filters[i].w.d[j] * dA;
			}

			this.parameters.biases.dw.d[i] += dA;
		}
	};

	lib.DotLayer = DotLayer;
})(nnjs);
(function (lib) { "use strict";

	function DropOutLayer(opt, net) {
		this.in = opt.input;
		this.out = opt.input;
		this.net = net;
		this.probability = opt.probability || 0.25;
	}

	DropOutLayer.prototype.forward = function (V, A) {
		if (!this.net.weak) {
			for (var i = 0; i < this.in.length; i++) { A.w.d[i] = V.w.d[i] * this.probability; } return ;
		}

		for (var i = 0; i < this.in.length; i++) {
			if (Math.random() < this.probability) {
				A.w.d[i] = 0.0;
				A.droppedOut[i] = true;
			} else {
				A.w.d[i] = V.w.d[i];
				A.droppedOut[i] = false;
			}
		}
	};

	DropOutLayer.prototype.backward = function (A, V) {
		if (!this.net.weak || A.droppedOut.length !== this.in.length) return ;

		for (var i = 0; i < this.in.length; i++) {
			if(!A.droppedOut[i]) {
				V.dw.d[i] = A.dw.d[i];
			}
		}
	};

	DropOutLayer.prototype.PrepareStateBlob = function (A) {
		A.droppedOut = [];
	};

	lib.DropOutLayer = DropOutLayer;
	
})(nnjs);
(function(lib) { "use strict";

    function InputLayer(opt) {
        this.out = opt.size;
        this.scale = opt.scale || 1.0;
        this.bias = opt.bias || 0.0;
    };

    InputLayer.prototype.forward = function(V, A) {
        A.w.copy(V, this.scale, this.bias);
    };

    InputLayer.prototype.backward = function(A, V) {};

    lib.InputLayer = InputLayer;
})(nnjs);

(function(lib) {
    "use strict";

    function sigm(x) {
        return 1.0 / (1.0 + Math.exp(-x));
    }

    function dsigm(y) {
        return y * (1 - y);
    }

    // see http://people.idsia.ch/~juergen/lstm/sld019.htm
    function LongShortTermMemoryLayer(opt) {
        this.in = opt.input;
        this.out = opt.input; // 1 to 1 mapping

        this.recurrent = true;
        this.parameters = {
            filters: [],
            biases: new lib.Blob(1, 1, this.out.depth, 0.0)
        };

        for (var i = 0; i < this.in.length; i++) {
            this.parameters.filters[i] = new lib.Blob(1, 1, 9, 0, 0.08);
            this.parameters.filters[i].w.d[2] = -1; // at beginning negative peephole connections
            this.parameters.filters[i].w.d[5] = -1; // to minimize exploding
            this.parameters.filters[i].w.d[8] = -1; // cell state
        }

        this.parameters.biases = new lib.Blob(1, this.in.length, 3, 0.0);
    };

    LongShortTermMemoryLayer.prototype.forward = function(V, A) {
        var bias = this.parameters.biases.w.d;
        for (var i = 0; i < this.out.length; i++) {
            var param = this.parameters.filters[i].w.d;

            var x = V.w.d[i];
            var h_ = A.prev.w.d[i];
            var c_ = A.prev.lstm.cells.w.d[i];

            var ig = sigm(x * param[0] + h_ * param[1] + c_ * param[2] + bias[i * 3 + 0]);
            var fg = sigm(x * param[3] + h_ * param[4] + c_ * param[5] + bias[i * 3 + 1]);
            var c = ig * x + fg * c_;
            var og = sigm(x * param[6] + h_ * param[7] + c  * param[8] + bias[i * 3 + 2]);
            var h = og * c;

            A.lstm.gates.in.d[i] = ig;
            A.lstm.gates.forget.d[i] = fg;
            A.lstm.gates.out.d[i] = og;

            A.lstm.cells.w.d[i] = c;
            A.w.d[i] = h;
        }
    };

    LongShortTermMemoryLayer.prototype.backward = function(A, V) {
        var BIAS = this.parameters.biases;
        var bias = BIAS.w.d;
        for (var i = 0; i < this.out.length; i++) {
            var PARAM = this.parameters.filters[i];
            var param = PARAM.w.d;
            
            var ig = A.lstm.gates.in.d[i];
            var fg = A.lstm.gates.forget.d[i];
            var og = A.lstm.gates.out.d[i];
            var c = A.lstm.cells.w.d[i];

            var x = V.w.d[i];
            var h_ = A.prev.w.d[i];
            var c_ = A.prev.lstm.cells.w.d[i];

            var dh = A.dw.d[i];
            var dc = A.lstm.cells.dw.d[i];

            var dog = dsigm(og) * c * dh;
                dc = dc + param[8] * dog + og * dh;
            var dfg = dsigm(fg) * c_ * dc;
            var dig = dsigm(ig) * x * dc;
            var dx = ig * dc + param[6] * dog + param[3] * dfg + param[0] * dig;

            var dc_ = fg * dc + param[5] * dfg + param[2] * dig;
            var dh_ = param[7] * dog + param[4] * dfg + param[1] * dig;

            A.prev.lstm.cells.dw.d[i] = dc_;
            A.prev.dw.d[i] += dh_; // add to already backpropped value
            V.dw.d[i] = dx;

            PARAM.dw.d[0] += x * dig;
            PARAM.dw.d[1] += h_ * dig;
            PARAM.dw.d[2] += c_ * dig;
            PARAM.dw.d[3] += x * dfg;
            PARAM.dw.d[4] += h_ * dfg;
            PARAM.dw.d[5] += c_ * dfg;
            PARAM.dw.d[6] += x * dog;
            PARAM.dw.d[7] += h_ * dog;
            PARAM.dw.d[8] += c * dog;

            BIAS.dw.d[i * 3 + 0] += 1.0 * dig;
            BIAS.dw.d[i * 3 + 1] += 1.0 * dfg;
            BIAS.dw.d[i * 3 + 2] += 1.0 * dog;
        }
    };

    LongShortTermMemoryLayer.prototype.PrepareStateBlob = function(A) {
        if (typeof A.state === 'undefined') {
            A.lstm = {
                cells: new lib.Blob(this.out.x, this.out.y, this.out.depth, 0.0),
                gates: { in : new lib.Mat(this.out.x, this.out.y, this.out.depth, 0.0),
                    out: new lib.Mat(this.out.x, this.out.y, this.out.depth, 0.0),
                    forget: new lib.Mat(this.out.x, this.out.y, this.out.depth, 0.0)
                }
            };
        } else {
            A.lstm.cells.w.all(0);
        }
    };

    lib.LongShortTermMemoryLayer = LongShortTermMemoryLayer;
})(nnjs);

(function (lib) { "use strict";
	function SigmoidLayer(opt) {
		this.in = opt.input;
		this.out = opt.input;
	};

	SigmoidLayer.prototype.forward = function (V, A) {
		for (var i = 0; i < this.in.length; i++) {
			A.w.d[i] = 1.0/(1.0+Math.exp(-V.w.d[i]));
		}
	}

	SigmoidLayer.prototype.backward = function (A, V) {
		for (var i = 0; i < this.in.length; i++) {
			V.dw.d[i] = A.w.d[i] * (-A.w.d[i] + 1.0) * A.dw.d[i];
		}
	};

	function ReluLayer(opt) {
		this.in = opt.input;
		this.out = opt.input;
	};

	ReluLayer.prototype.forward = function (V, A) {
		for (var i = 0; i < this.in.length; i++) {
			A.w.d[i] = V.w.d[i] < 0 ? 0 : V.w.d[i];
		}
	}

	ReluLayer.prototype.backward = function (A, V) {
		for (var i = 0; i < this.in.length; i++) {
			if(A.w.d[i] <= 0) V.dw.d[i] = 0; // threshold
	        else V.dw.d[i] = A.dw.d[i];
		}
	};

	function TanhLayer(opt) {
		this.in = opt.input;
		this.out = opt.input;
	};

	TanhLayer.prototype.forward = function (V, A) {
		for (var i = 0; i < this.in.length; i++) {
			A.w.d[i] = lib.MathU.tanh(V.w.d[i]);
		}
	}

	TanhLayer.prototype.backward = function (A, V) {
		for (var i = 0; i < this.in.length; i++) {
			V.dw.d[i] = (1.0 - A.w.d[i] * A.w.d[i]) * A.dw.d[i];
	 	}
	};

	lib.SigmoidLayer = SigmoidLayer;
	lib.ReluLayer = ReluLayer;
	lib.TanhLayer = TanhLayer;
})(nnjs);
(function (lib) { "use strict";

	function RegressionLayer(opt) {
		this.in = opt.input;
		this.out = opt.input;
	};

	RegressionLayer.prototype.forward = function (V, A) {
		A.w.write(V.w);
	};

	RegressionLayer.prototype.backward = function (A, V, desired) {
		var loss = 0.0;
		if(desired instanceof Array || desired instanceof Float64Array) {
			for(var i = 0; i < this.out.length; ++i) {
				V.dw.d[i] = A.w.d[i] - desired[i];
				loss += 0.5*V.dw.d[i]*V.dw.d[i];
			}
		}

		return loss;
	};

	lib.RegressionLayer = RegressionLayer;

})(nnjs);
(function (lib) { "use strict";

	function SoftmaxLayer(opt) {
		this.in = opt.input;
		this.out = lib.Size3(1, 1, this.in.x * this.in.y * this.in.depth);
		this.classes = this.out.depth;
	};

	SoftmaxLayer.prototype.forward = function (V, A) {
		// compute max activation
		var amax = V.w.d[0];
		for (var i = 1; i < this.classes; i++) {
			if(V.w.d[i] > amax) amax = V.w.d[i];
		}

		// compute exponentials (carefully to not blow up)
		var es = lib.Mat.CreateArray(this.out.depth, 0.0), esum = 0.0;
		for (var i = 0; i < this.classes; i++) {
			var e = Math.exp(V.w.d[i] - amax);
			esum += e;
			es[i] = e;
		}

		// normalize and output to sum to one
		for (var i = 0; i < this.classes; i++) {
			es[i] /= esum;
			A.w.d[i] = es[i];
		}

		return A.w.maxi();
	};

	SoftmaxLayer.prototype.backward = function (A, V, desired) {
		for (var i = 0; i < this.classes; i++) {
			var indicator = i === desired ? 1.0 : 0.0;
			V.dw.d[i] = A.w.d[i] - indicator;
		}

		// loss is the class negative log likelihood
		return -Math.log(A.w.d[desired]);
	};

	/* approx. 300x faster than softmax, decrease in accuracy and performance */
	/**
	 * @param {object} tree [object] or classes [int]
	 */
	function HierarchicalSoftmax(opt) {
		this.in = opt.input;

		if (opt.tree) {
			this.tree = opt.tree;
		} else {
			this.tree = this.BuildTree(opt.classes);
		}

		this.PrepareTree();

		assert(opt.classes === undefined || (opt.classes === this.classes), 'HierarchicalSoftmax: tree not supported');

		this.nodes = this.classes - 1;
		this.parameters = {
			filters: [],
			biases: new lib.Blob(1, 1, this.nodes, 0.0)
		};

		for (var i = 0; i < this.nodes; i++) {
			this.parameters.filters[i] = new lib.Blob(1, 1, this.in.length);
		}
	};

	HierarchicalSoftmax.POINTER = 0;
	HierarchicalSoftmax.SELECTOR = 1;

	HierarchicalSoftmax.prototype.BuildTree = function (classes) {
		// create tree of size log(classes)
		var depth = Math.floor(Math.log2(classes));
		var tree = this.CreateNode(depth, null);

		// add remaining nodes to tree
		var remainder = classes - Math.pow(2, depth);
		this.traverse(tree, function (node) {
			if (node.type === HierarchicalSoftmax.SELECTOR && remainder > 0) {
				node.type = HierarchicalSoftmax.POINTER;
				node.a = this.CreateNode(0, node);
				node.b = this.CreateNode(0, node);

				remainder--;

				return false;
			}

			return true;
		});

		return tree;
	}; 

	HierarchicalSoftmax.prototype.PrepareTree = function () {
		var sel = 0, ptr = 0, table = {};
		this.traverse(this.tree, function (node) {
			if (node.type === HierarchicalSoftmax.SELECTOR) {
				table[sel] = node;
				node.index = sel;
			++sel;}

			else if (node.type === HierarchicalSoftmax.POINTER) {
				node.index = ptr;
			ptr++;}

			return true;
		});

		this.classes = sel;
		this.nodes = ptr;
		this.table = table;
	};

	HierarchicalSoftmax.prototype.CreateNode = function (depth, parent) {
		var node = { parent: parent };

		if (depth <= 0) {
			node.type = HierarchicalSoftmax.SELECTOR;
		} else {
			node.type = HierarchicalSoftmax.POINTER;
			node.a = this.CreateNode(depth-1, node);
			node.b = this.CreateNode(depth-1, node);
		}

		return node;
	};

	HierarchicalSoftmax.prototype.traverse = function (node, cb) {
		if (cb.call(this, node) && node.type === HierarchicalSoftmax.POINTER) {
			this.traverse(node.a, cb);
			this.traverse(node.b, cb);
		}
	};

	HierarchicalSoftmax.prototype.ascend = function (node, cb) {
		if (node.parent === null) return ;
		cb.call(this, node.parent, node === node.parent.a ? -1.0 : 1.0);
		this.ascend(node.parent, cb);
	};

	HierarchicalSoftmax.prototype.descend = function (node, cb) {
		var d = cb.call(this, node);

		if (node.type === HierarchicalSoftmax.SELECTOR || d instanceof Object || d === null) {
			return d;
		}

		if (d > 0.0) { // negative means left, positive means right
			return this.descend(node.b, cb);
		} else {
			return this.descend(node.a, cb);
		}
	};

	HierarchicalSoftmax.prototype.activate = function (V, i) {
		var sum = 0.0;
		for (var j = 0; j < this.in.length; j++) {
			sum += V.w.d[j] * this.parameters.filters[i].w.d[j];
		}

		return lib.MathU.tanh(this.parameters.biases.w.d[i] + sum);
	};

	HierarchicalSoftmax.prototype.gradient = function (V, i, direction) {
		var act = this.activate(V, i),
				err = act - direction;

		var dw = (1.0 - act * act) * err;
		this.parameters.filters[i].nochange = false;

		for (var j = 0; j < this.in.length; j++) {
			this.parameters.filters[i].dw.d[j] += V.w.d[j] * dw;
			V.dw.d[j] += this.parameters.filters[i].w.d[j] * dw;
		}

		this.parameters.biases.dw.d[i] += dw;

		return (direction < 0 ? 1 - (act * 0.5 + 0.5) : (act * 0.5 + 0.5)); // probability to go the right way
	};

	HierarchicalSoftmax.prototype.forward = function (V, A) {
		var selected = this.descend(this.tree, function (node) {
			if (node.type === HierarchicalSoftmax.POINTER) {
				return this.activate(V, node.index);
			}

			else if (node.type === HierarchicalSoftmax.SELECTOR) {
				return node;
			}

			return null;
		});

		return (A.index = selected.index);
	};

	HierarchicalSoftmax.prototype.backward = function (A, V, desired) {
		for (var i = 0; i < this.parameters.filters.length; i++) {
			this.parameters.filters[i].nochange = true;
		}

		var prob = 1.0;
		this.ascend(this.table[desired], function (node, direction) {
			prob = prob * this.gradient(V, node.index, direction);
		});

		return 1.0 - prob; // probability to NOT go the right way
	};

	lib.SoftmaxLayer = SoftmaxLayer;
	lib.HierarchicalSoftmax = HierarchicalSoftmax;
})(nnjs);
(function(lib) { "use strict";

    if (typeof module === "undefined" || typeof module.exports === "undefined") {
    	if (typeof window !== 'undefined') { // web worker support; just use nnjs in web worker
    		window.nn = lib;
    	}
    } else {
        module.exports = lib;
    }
    
})(nnjs);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5uLmluaXQuanMiLCJubi5tYXRoLmpzIiwiYXBpL25ldHdvcmsubm4uanMiLCJsYXllcnMvY29udm9sdXRpb25hbC5ubi5qcyIsImxheWVycy9kb3Qubm4uanMiLCJsYXllcnMvZHJvcG91dC5ubi5qcyIsImxheWVycy9pbnB1dC5ubi5qcyIsImxheWVycy9sc3RtLm5uLmpzIiwibGF5ZXJzL25vbi1saW5lYXIubm4uanMiLCJsYXllcnMvcmVncmVzc2lvbi5ubi5qcyIsImxheWVycy9zb2Z0bWF4Lm5uLmpzIiwibm4uZXhwb3J0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDalVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im5uLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIG5uanMgPSB7fTtcblxuLy8gVXRpbGl0eSBmdW5cbmZ1bmN0aW9uIGFzc2VydChjb25kaXRpb24sIG1lc3NhZ2UpIHtcbiAgICAvLyBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTUzMTM0MTgvamF2YXNjcmlwdC1hc3NlcnRcbiAgICBpZiAoIWNvbmRpdGlvbikge1xuICAgICAgICBtZXNzYWdlID0gbWVzc2FnZSB8fCBcIkFzc2VydGlvbiBmYWlsZWRcIjtcbiAgICAgICAgaWYgKHR5cGVvZiBFcnJvciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG1lc3NhZ2U7IC8vIEZhbGxiYWNrXG4gICAgfVxufVxuXG4oZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG4gICAgdmFyIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuICAgIHZhciBpc0FycmF5ID0gZnVuY3Rpb24gaXNBcnJheShhcnIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShhcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRvU3RyLmNhbGwoYXJyKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICB9O1xuXG4gICAgdmFyIGlzUGxhaW5PYmplY3QgPSBmdW5jdGlvbiBpc1BsYWluT2JqZWN0KG9iaikge1xuICAgICAgICBpZiAoIW9iaiB8fCB0b1N0ci5jYWxsKG9iaikgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaGFzT3duQ29uc3RydWN0b3IgPSBoYXNPd24uY2FsbChvYmosICdjb25zdHJ1Y3RvcicpO1xuICAgICAgICB2YXIgaGFzSXNQcm90b3R5cGVPZiA9IG9iai5jb25zdHJ1Y3RvciAmJiBvYmouY29uc3RydWN0b3IucHJvdG90eXBlICYmIGhhc093bi5jYWxsKG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUsICdpc1Byb3RvdHlwZU9mJyk7XG4gICAgICAgIC8vIE5vdCBvd24gY29uc3RydWN0b3IgcHJvcGVydHkgbXVzdCBiZSBPYmplY3RcbiAgICAgICAgaWYgKG9iai5jb25zdHJ1Y3RvciAmJiAhaGFzT3duQ29uc3RydWN0b3IgJiYgIWhhc0lzUHJvdG90eXBlT2YpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE93biBwcm9wZXJ0aWVzIGFyZSBlbnVtZXJhdGVkIGZpcnN0bHksIHNvIHRvIHNwZWVkIHVwLFxuICAgICAgICAvLyBpZiBsYXN0IG9uZSBpcyBvd24sIHRoZW4gYWxsIHByb3BlcnRpZXMgYXJlIG93bi5cbiAgICAgICAgdmFyIGtleTtcbiAgICAgICAgZm9yIChrZXkgaW4gb2JqKSB7IC8qKi8gfVxuXG4gICAgICAgIHJldHVybiB0eXBlb2Yga2V5ID09PSAndW5kZWZpbmVkJyB8fCBoYXNPd24uY2FsbChvYmosIGtleSk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGV4dGVuZCgpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMsIG5hbWUsIHNyYywgY29weSwgY29weUlzQXJyYXksIGNsb25lO1xuICAgICAgICB2YXIgdGFyZ2V0ID0gYXJndW1lbnRzWzBdO1xuICAgICAgICB2YXIgaSA9IDE7XG4gICAgICAgIHZhciBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICB2YXIgZGVlcCA9IGZhbHNlO1xuXG4gICAgICAgIC8vIEhhbmRsZSBhIGRlZXAgY29weSBzaXR1YXRpb25cbiAgICAgICAgaWYgKHR5cGVvZiB0YXJnZXQgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgZGVlcCA9IHRhcmdldDtcbiAgICAgICAgICAgIHRhcmdldCA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcbiAgICAgICAgICAgIC8vIHNraXAgdGhlIGJvb2xlYW4gYW5kIHRoZSB0YXJnZXRcbiAgICAgICAgICAgIGkgPSAyO1xuICAgICAgICB9IGVsc2UgaWYgKCh0eXBlb2YgdGFyZ2V0ICE9PSAnb2JqZWN0JyAmJiB0eXBlb2YgdGFyZ2V0ICE9PSAnZnVuY3Rpb24nKSB8fCB0YXJnZXQgPT0gbnVsbCkge1xuICAgICAgICAgICAgdGFyZ2V0ID0ge307XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gYXJndW1lbnRzW2ldO1xuICAgICAgICAgICAgLy8gT25seSBkZWFsIHdpdGggbm9uLW51bGwvdW5kZWZpbmVkIHZhbHVlc1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIEV4dGVuZCB0aGUgYmFzZSBvYmplY3RcbiAgICAgICAgICAgICAgICBmb3IgKG5hbWUgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICBzcmMgPSB0YXJnZXRbbmFtZV07XG4gICAgICAgICAgICAgICAgICAgIGNvcHkgPSBvcHRpb25zW25hbWVdO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFByZXZlbnQgbmV2ZXItZW5kaW5nIGxvb3BcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldCAhPT0gY29weSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVjdXJzZSBpZiB3ZSdyZSBtZXJnaW5nIHBsYWluIG9iamVjdHMgb3IgYXJyYXlzXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVlcCAmJiBjb3B5ICYmIChpc1BsYWluT2JqZWN0KGNvcHkpIHx8IChjb3B5SXNBcnJheSA9IGlzQXJyYXkoY29weSkpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb3B5SXNBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3B5SXNBcnJheSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9uZSA9IHNyYyAmJiBpc0FycmF5KHNyYykgPyBzcmMgOiBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9uZSA9IHNyYyAmJiBpc1BsYWluT2JqZWN0KHNyYykgPyBzcmMgOiB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOZXZlciBtb3ZlIG9yaWdpbmFsIG9iamVjdHMsIGNsb25lIHRoZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRbbmFtZV0gPSBleHRlbmQoZGVlcCwgY2xvbmUsIGNvcHkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRG9uJ3QgYnJpbmcgaW4gdW5kZWZpbmVkIHZhbHVlc1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY29weSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRbbmFtZV0gPSBjb3B5O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3RcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9O1xuXG4gICAgT2JqZWN0LmV4dGVuZCA9IGV4dGVuZDtcbn0pKCk7XG4iLCIoZnVuY3Rpb24obGliKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIG1hdGggPSB7XG4gICAgICAgIGdhdXNzXzogeyBhOiBmYWxzZSwgYjogMC4wIH0sXG4gICAgICAgIGdhdXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChtYXRoLmdhdXNzXy5hKSB7IG1hdGguZ2F1c3NfLmEgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWF0aC5nYXVzc18uYjsgfVxuICAgICAgICAgICAgdmFyIHUgPSAyICogTWF0aC5yYW5kb20oKSAtIDE7XG4gICAgICAgICAgICB2YXIgdiA9IDIgKiBNYXRoLnJhbmRvbSgpIC0gMTtcbiAgICAgICAgICAgIHZhciByID0gdSAqIHUgKyB2ICogdjtcbiAgICAgICAgICAgIGlmIChyID09IDAgfHwgciA+IDEpIHJldHVybiBtYXRoLmdhdXNzKCk7XG4gICAgICAgICAgICB2YXIgYyA9IE1hdGguc3FydCgtMiAqIE1hdGgubG9nKHIpIC8gcik7XG4gICAgICAgICAgICBtYXRoLmdhdXNzXy5iID0gdiAqIGM7IC8vIGNhY2hlIHRoaXNcbiAgICAgICAgICAgIG1hdGguZ2F1c3NfLmEgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIHUgKiBjO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJhbmRmOiBmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSAqIChiIC0gYSkgKyBhO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJhbmRpOiBmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGIgLSBhKSArIGEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJhbmRuOiBmdW5jdGlvbihtdSwgc3RkKSB7XG4gICAgICAgICAgICByZXR1cm4gbXUgKyBtYXRoLmdhdXNzKCkgKiBzdGQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdGFuaDogdHlwZW9mIE1hdGgudGFuaCA9PT0gXCJ1bmRlZmluZWRcIiA/IGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgICAgIHZhciB5ID0gTWF0aC5leHAoMiAqIHgpO1xuICAgICAgICAgICAgcmV0dXJuICh5IC0gMSkgLyAoeSArIDEpOyB9IDogTWF0aC50YW5oXG4gICAgfTtcblxuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIGZ1bmN0aW9uIFNpemUyKHgsIHkpIHtcbiAgICAgICAgcmV0dXJuIHsgeDogeCwgeTogeSwgbGVuZ3RoOiB4ICogeSB9O1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBTaXplMyh4LCB5LCB6KSB7XG4gICAgICAgIHJldHVybiB7IHg6IHgsIHk6IHksIGRlcHRoOiB6LCBsZW5ndGg6IHggKiB5ICogeiB9O1xuICAgIH07XG5cblxuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIGZ1bmN0aW9uIE1hdCh4LCB5LCB6LCB2KSB7XG4gICAgICAgIHRoaXMuc2l6ZSA9IGxpYi5TaXplMyh4LCB5LCB6KTtcbiAgICAgICAgdGhpcy5kID0gTWF0LkNyZWF0ZUFycmF5KHggKiB5ICogeiwgdiA9PT0gdW5kZWZpbmVkID8gMC4wIDogdiwgJ0Zsb2F0NjRBcnJheScpO1xuICAgIH07XG5cbiAgICBNYXQuQ3JlYXRlQXJyYXkgPSBmdW5jdGlvbihsZW5ndGgsIHYsIHQpIHtcbiAgICAgICAgdmFyIGFyciA9IG51bGw7XG5cbiAgICAgICAgdiA9IHYgfHwgMDtcbiAgICAgICAgdCA9IHQgfHwgJ0Zsb2F0NjRBcnJheSc7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBBcnJheUJ1ZmZlciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGFyciA9IG5ldyBBcnJheShsZW5ndGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXJyID0gZXZhbCgnbmV3ICcgKyB0ICsgJyhsZW5ndGgpJyk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7IGFycltpXSA9IHY7IH1cbiAgICAgICAgcmV0dXJuIGFycjtcbiAgICB9O1xuXG4gICAgTWF0LmNvcHkgPSBmdW5jdGlvbihtYXQpIHtcbiAgICAgICAgdmFyIG1hdF8gPSBuZXcgbWF0KG1hdC5zaXplLngsIG1hdC5zaXplLnksIG1hdC5zaXplLmRlcHRoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXQuZC5sZW5ndGg7IGkrKykgeyBtYXRfLmRbaV0gPSBtYXQuZFtpXTsgfVxuICAgICAgICByZXR1cm4gbWF0XztcbiAgICB9O1xuXG4gICAgTWF0LnByb3RvdHlwZS5tYXhpID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gMCwgbSA9IC1JbmZpbml0eTsgaSA8IHRoaXMuZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXMuZFtpXSA+IG0pIHtcbiAgICAgICAgICAgICAgICBqID0gaSwgbSA9IHRoaXMuZFtpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBqO1xuICAgIH07XG5cbiAgICBNYXQucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKHgsIHksIHopIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZFsoeSAqIHRoaXMuc2l6ZS54ICsgeCkgKiB0aGlzLnNpemUuZGVwdGggKyB6XTtcbiAgICB9O1xuXG4gICAgTWF0LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbih4LCB5LCB6LCB2KSB7XG4gICAgICAgIHRoaXMuZFsoeSAqIHRoaXMuc2l6ZS54ICsgeCkgKiB0aGlzLnNpemUuZGVwdGggKyB6XSA9IHY7XG4gICAgfTtcblxuICAgIE1hdC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oeCwgeSwgeiwgdikge1xuICAgICAgICB0aGlzLmRbKHkgKiB0aGlzLnNpemUueCArIHgpICogdGhpcy5zaXplLmRlcHRoICsgel0gKz0gdjtcbiAgICB9O1xuXG4gICAgTWF0LnByb3RvdHlwZS5hbGwgPSBmdW5jdGlvbih2KSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kLmxlbmd0aDsgaSsrKSB7IHRoaXMuZFtpXSA9IHY7IH1cbiAgICB9O1xuXG4gICAgTWF0LnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24oYSwgcywgYikge1xuICAgICAgICBpZiAocyA9PT0gdW5kZWZpbmVkKSBzID0gMTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmQubGVuZ3RoOyBpKyspIHsgdGhpcy5kW2ldID0gYVtpXSAvIHMgKyBiOyB9XG4gICAgfTtcblxuICAgIE1hdC5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbihhKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kLmxlbmd0aDsgaSsrKSB7IHRoaXMuZFtpXSA9IGEuZFtpXTsgfVxuICAgIH07XG5cbiAgICBNYXQucHJvdG90eXBlLnJhbmRmID0gZnVuY3Rpb24oYSwgYikge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZC5sZW5ndGg7IGkrKykgeyB0aGlzLmRbaV0gPSBtYXRoLnJhbmRmKGEsIGIpOyB9XG4gICAgfTtcblxuICAgIE1hdC5wcm90b3R5cGUucmFuZG4gPSBmdW5jdGlvbihzY2FsZSkge1xuICAgICAgICBzY2FsZSA9IHNjYWxlIHx8IE1hdGguc3FydCgxLjAgLyAodGhpcy5zaXplLnggKiB0aGlzLnNpemUueSAqIHRoaXMuc2l6ZS5kZXB0aCkpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZC5sZW5ndGg7IGkrKykgeyB0aGlzLmRbaV0gPSBtYXRoLnJhbmRuKDAuMCwgc2NhbGUpOyB9XG4gICAgfTtcblxuICAgIE1hdC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG1hdC5jb3B5KHRoaXMpO1xuICAgIH07XG5cbiAgICAvLyBhY2Nlc3NvclxuICAgIC8vIFsgKHkgKiB0aGlzLnNpemUueCArIHgpICogdGhpcy5zaXplLmRlcHRoICsgeiBdXG5cblxuICAgIGZ1bmN0aW9uIEJsb2IoeCwgeSwgeiwgYSwgYikge1xuICAgICAgICB0aGlzLnNpemUgPSBsaWIuU2l6ZTMoeCwgeSwgeik7XG4gICAgICAgIHRoaXMudyA9IG5ldyBNYXQoeCwgeSwgeik7XG4gICAgICAgIHRoaXMuZHcgPSBuZXcgTWF0KHgsIHksIHopO1xuXG4gICAgICAgIGlmIChhICE9PSB1bmRlZmluZWQgJiYgYiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLncucmFuZGYoYSwgYik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLncucmFuZG4oKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIGxpYi5NYXRoVSA9IG1hdGg7XG4gICAgbGliLlNpemUyID0gU2l6ZTI7XG4gICAgbGliLlNpemUzID0gU2l6ZTM7XG4gICAgbGliLk1hdCA9IE1hdDtcbiAgICBsaWIuQmxvYiA9IEJsb2I7XG5cbn0pKG5uanMpO1xuIiwiKGZ1bmN0aW9uIChsaWIpIHsgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICAvKipcbiAgICAgKiBIZWxwZXIgZnVuY3Rpb24sIHRoYXQgY29udmVydHMgYSBkZXNjcmlwdGlvbiBpbnRvIGFuIGFjdHVhbCBsYXllciBvYmplY3RcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGVzY3JpcHRpb25cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBMYXllcihvcHQsIG5ldCkge1xuICAgICAgICBzd2l0Y2ggKG9wdC50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdpbnB1dCc6IHJldHVybiBuZXcgbGliLklucHV0TGF5ZXIob3B0LCBuZXQpO1xuICAgICAgICAgICAgY2FzZSAnZG90JzogcmV0dXJuIG5ldyBsaWIuRG90TGF5ZXIob3B0LCBuZXQpO1xuICAgICAgICAgICAgY2FzZSAnY29udic6IHJldHVybiBuZXcgbGliLkNvbnZvbHV0aW9uYWxMYXllcihvcHQsIG5ldCk7XG4gICAgICAgICAgICBjYXNlICdsc3RtJzogcmV0dXJuIG5ldyBsaWIuTG9uZ1Nob3J0VGVybU1lbW9yeUxheWVyKG9wdCwgbmV0KTtcbiAgICAgICAgICAgIGNhc2UgJ3Bvb2wnOiByZXR1cm4gbmV3IGxpYi5Qb29saW5nTGF5ZXIob3B0LCBuZXQpO1xuICAgICAgICAgICAgY2FzZSAnc2lnbW9pZCc6IHJldHVybiBuZXcgbGliLlNpZ21vaWRMYXllcihvcHQsIG5ldCk7XG4gICAgICAgICAgICBjYXNlICdyZWx1JzogcmV0dXJuIG5ldyBsaWIuUmVsdUxheWVyKG9wdCwgbmV0KTtcbiAgICAgICAgICAgIGNhc2UgJ3RhbmgnOiByZXR1cm4gbmV3IGxpYi5UYW5oTGF5ZXIob3B0LCBuZXQpO1xuICAgICAgICAgICAgY2FzZSAnZHJvcG91dCc6IHJldHVybiBuZXcgbGliLkRyb3BPdXRMYXllcihvcHQsIG5ldCk7XG4gICAgICAgICAgICBjYXNlICdzb2Z0bWF4JzogcmV0dXJuIG5ldyBsaWIuU29mdG1heExheWVyKG9wdCwgbmV0KTtcbiAgICAgICAgICAgIGNhc2UgJ2hzbSc6IHJldHVybiBuZXcgbGliLkhpZXJhcmNoaWNhbFNvZnRtYXgob3B0LCBuZXQpO1xuICAgICAgICAgICAgY2FzZSAncmVncmVzc2lvbic6IHJldHVybiBuZXcgbGliLlJlZ3Jlc3Npb25MYXllcihvcHQsIG5ldCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBOZXR3b3JrU3RydWN0dXJlKGRlc2MsIG5ldCkge1xuICAgICAgICB0aGlzLm5ldCA9IG5ldDtcbiAgICAgICAgdGhpcy5kZXNjcmlwdGlvbiA9IGRlc2M7XG4gICAgICAgIHRoaXMubGVuZ3RoID0gZGVzYy5sZW5ndGg7IC8vIGNvbnZpZW5pZW5jZVxuICAgICAgICB0aGlzLnJlY3VycmVudCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuQnVpbGQoKTtcbiAgICB9O1xuXG4gICAgTmV0d29ya1N0cnVjdHVyZS5wcm90b3R5cGUuQnVpbGQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubGlzdCA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZGVzY3JpcHRpb24ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVzY3JpcHRpb25baV0uaW5wdXQgPSB0aGlzLmxpc3RbaSAtIDFdLm91dDsgLy8gc2V0IGlucHV0IHRvIHRoaXMgbGF5ZXIgdG8gdGhlIG91dHB1dCBvZiBsYXN0IGxheWVyXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMubGlzdFtpXSA9IExheWVyKHRoaXMuZGVzY3JpcHRpb25baV0sIHRoaXMubmV0KTtcblxuICAgICAgICAgICAgaWYgKHRoaXMubGlzdFtpXS5yZWN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlY3VycmVudCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9OyAgXG5cbiAgICBOZXR3b3JrU3RydWN0dXJlLnByb3RvdHlwZS5zdGF0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHN0YXRzID0geyBwYXJhbWV0ZXJzOiAwIH07XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5saXN0W2ldLnBhcmFtZXRlcnMgPT09IHVuZGVmaW5lZCkgY29udGludWU7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5saXN0W2ldLnBhcmFtZXRlcnMuZmlsdGVycy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIHN0YXRzLnBhcmFtZXRlcnMgKz0gdGhpcy5saXN0W2ldLnBhcmFtZXRlcnMuZmlsdGVyc1tqXS5zaXplLmxlbmd0aDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3RhdHMucGFyYW1ldGVycyArPSB0aGlzLmxpc3RbaV0ucGFyYW1ldGVycy5iaWFzZXMuc2l6ZS5sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3RhdHM7XG4gICAgfTtcblxuICAgIE5ldHdvcmtTdHJ1Y3R1cmUucHJvdG90eXBlLnBhcmFtZXRlcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBwYXJhbWV0ZXJzID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5saXN0W2ldLnBhcmFtZXRlcnMgPT09IHVuZGVmaW5lZCkgY29udGludWU7XG5cbiAgICAgICAgICAgIHZhciBvYmplY3QgPSB7IGZpbHRlcnM6IFtdLCBiaWFzZXM6IHRoaXMubGlzdFtpXS5wYXJhbWV0ZXJzLmJpYXNlcy53LmQgfTtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5saXN0W2ldLnBhcmFtZXRlcnMuZmlsdGVycy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIG9iamVjdC5maWx0ZXJzW2pdID0gdGhpcy5saXN0W2ldLnBhcmFtZXRlcnMuZmlsdGVyc1tqXS53LmQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHBhcmFtZXRlcnNbaV0gPSBvYmplY3Q7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyYW1ldGVycztcbiAgICB9O1xuXG4gICAgTmV0d29ya1N0cnVjdHVyZS5wcm90b3R5cGUuYXQgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICBpID0gaSA+PSAwID8gaSA6IHRoaXMubGVuZ3RoICsgaTtcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdFtpXTtcbiAgICB9O1xuXG4gICAgLy8gY3VycmVudCBzdGF0ZVxuICAgIGZ1bmN0aW9uIE5ldHdvcmtTdGF0ZShuZXQpIHtcbiAgICAgICAgdGhpcy5uZXQgPSBuZXQ7XG4gICAgICAgIHRoaXMubGF5ZXJzID0gbmV0LmxheWVycztcbiAgICAgICAgdGhpcy53aWR0aCA9IG5ldC5sYXllcnMubGVuZ3RoOyAvLyBob3cgbWFueSBsYXllcnM/XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5sYXllcnMucmVjdXJyZW50ID8gdGhpcy5uZXQubGVhcm5lci50aW1lc3BhbiA6IDE7IC8vIGhvdyBsb25nIGJwdHQ/IC8gdGltZSBzdGVwc1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMubGF5ZXJzLnJlY3VycmVudCkge1xuICAgICAgICAgICAgdGhpcy5ibG9icyA9IHRoaXMuQnVpbGQodGhpcy5uZXQubGVhcm5lci50aW1lc3BhbiArIDEpOyAvLyBsYXN0IG9uZSBuZWVkcyByZWZlcmVuY2UgdG8gcHJldmlvdXNcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYmxvYnMgPSB0aGlzLkJ1aWxkKDEpOyAvLyBvbmx5IG9uZSB0aW1lIG5lZWRlZFxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIFsgWyBzdGF0ZSBmb3IgVD0wIF0sIFsgc3RhdGUgZm9yIFQ9MSBdLCAuLi4gXVxuICAgIE5ldHdvcmtTdGF0ZS5wcm90b3R5cGUuQnVpbGQgPSBmdW5jdGlvbiAoaCwgUykge1xuICAgICAgICB2YXIgVCA9IFtdO1xuICAgICAgICBmb3IgKHZhciB0ID0gMDsgdCA8IGg7IHQrKykge1xuICAgICAgICAgICAgVC51bnNoaWZ0KHRoaXMuQnVpbGRTdGF0ZShULCBTICE9PSB1bmRlZmluZWQgPyBTW3RdIDogdW5kZWZpbmVkKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gVDtcbiAgICB9O1xuXG4gICAgLy8gWyBbIEJsb2IgZm9yIGxheWVyIDEgXSwgWyBCbG9iIGZvciBsYXllciAyIF0sIC4uLiBdXG4gICAgTmV0d29ya1N0YXRlLnByb3RvdHlwZS5CdWlsZFN0YXRlID0gZnVuY3Rpb24gKFQsIFMpIHtcbiAgICAgICAgUyA9IFMgfHwgW107XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmxheWVycy5saXN0W2ldLm91dCAhPT0gJ3VuZGVmaW5lZCcgJiYgU1tpXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgU1tpXSA9IG5ldyBsaWIuQmxvYih0aGlzLmxheWVycy5saXN0W2ldLm91dC54LCB0aGlzLmxheWVycy5saXN0W2ldLm91dC55LCB0aGlzLmxheWVycy5saXN0W2ldLm91dC5kZXB0aCwgMC4wKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoU1tpXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgU1tpXSA9IHt9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBTW2ldLncuYWxsKDApLCBTW2ldLmR3LmFsbCgwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmxheWVycy5saXN0W2ldLnJlY3VycmVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgdGhpcy5sYXllcnMubGlzdFtpXS5yZWN1cnJlbnRcbiAgICAgICAgICAgICAgICAgICAgJiYgVCAhPT0gdW5kZWZpbmVkICYmIFQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIFNbaV0ucHJldiA9IFRbMF1baV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5sYXllcnMubGlzdFtpXS5QcmVwYXJlU3RhdGVCbG9iICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHRoaXMubGF5ZXJzLmxpc3RbaV0uUHJlcGFyZVN0YXRlQmxvYihTW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBTO1xuICAgIH07XG5cbiAgICBOZXR3b3JrU3RhdGUucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmJsb2JzID0gdGhpcy5CdWlsZCh0aGlzLmJsb2JzLmxlbmd0aCwgdGhpcy5ibG9icyk7XG4gICAgfTtcblxuICAgIE5ldHdvcmtTdGF0ZS5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMubGF5ZXJzLnJlY3VycmVudCkgeyAvLyBvbmx5IGlmIHJlY3VycmVudFxuICAgICAgICAgICAgdmFyIFMgPSB0aGlzLmJsb2JzLnBvcCgpO1xuICAgICAgICAgICAgdGhpcy5ibG9icy51bnNoaWZ0KHRoaXMuQnVpbGRTdGF0ZSh0aGlzLmJsb2JzLCBTKSk7IC8vIHJldXNhYmlsaXR5XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2lkdGgubGVuZ3RoOyBpKyspIHsgXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYmxvYnNbdGhpcy5oZWlnaHRdW2ldLnByZXYpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYmxvYnNbdGhpcy5oZWlnaHRdW2ldLnByZXYgPSBudWxsOyBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNsZWFuIGdyYWRpZW50c1xuICAgICAgICBmb3IgKHZhciB0ID0gMDsgdCA8IHRoaXMuYmxvYnMubGVuZ3RoOyB0KyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy53aWR0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ibG9ic1t0XVtpXS5kdy5hbGwoMC4wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBOZXR3b3JrU3RhdGUucHJvdG90eXBlLmF0ID0gZnVuY3Rpb24gKGksIHQpIHtcbiAgICAgICAgdCA9IHQgfHwgMDtcbiAgICAgICAgdCA9IHQgPj0gMCA/IHQgOiB0aGlzLmhlaWdodCArIHQ7XG5cbiAgICAgICAgaSA9IGkgfHwgMDtcbiAgICAgICAgaSA9IGkgPj0gMCA/IGkgOiB0aGlzLndpZHRoICsgaTtcblxuICAgICAgICByZXR1cm4gdGhpcy5ibG9ic1t0XVtpXTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtvYmplY3R9XG4gICAgICovXG4gICAgZnVuY3Rpb24gTmV0d29yayhvcHQpIHtcbiAgICAgICAgdGhpcy5sZWFybmVyID0gb3B0LmxlYXJuZXI7XG4gICAgICAgIHRoaXMubGVhcm5lciA9IE9iamVjdC5leHRlbmQodHJ1ZSwge1xuICAgICAgICAgICAgbWV0aG9kOiAnc2dkJyxcbiAgICAgICAgICAgIGJhdGNoOiAxLFxuICAgICAgICAgICAgZGVjYXk6IHsgbDE6IDAsIGwyOiAwIH0sXG4gICAgICAgICAgICBjbGlwOiBJbmZpbml0eSxcbiAgICAgICAgICAgIHRpbWVzcGFuOiAxIC8vIG9ubHkgZm9yIHJublxuICAgICAgICB9LCB0aGlzLmxlYXJuZXIpO1xuXG4gICAgICAgIHRoaXMubGVhcm5lciA9IE9iamVjdC5leHRlbmQodHJ1ZSwgdGhpcy5nZFt0aGlzLmxlYXJuZXIubWV0aG9kXS5kZWZhdWx0cywgdGhpcy5sZWFybmVyKTtcbiAgICAgICAgdGhpcy53ZWFrID0gdHJ1ZTsgLy8gZHJvcG91dCBlbmFibGVkP1xuICAgICAgICB0aGlzLnBhc3MgPSAwO1xuXG4gICAgICAgIHRoaXMubGF5ZXJzID0gbmV3IE5ldHdvcmtTdHJ1Y3R1cmUob3B0LmxheWVycywgdGhpcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBuZXcgTmV0d29ya1N0YXRlKHRoaXMpOyAvLyBleGNoYW5nYWJsZVxuICAgIH07XG5cbiAgICBOZXR3b3JrLnByb3RvdHlwZS5mb3J3YXJkID0gZnVuY3Rpb24oaW5wKSB7XG4gICAgICAgIC8vIGdvIGZvcndhcmRzIHRocm91Z2ggbmV0d29ya1xuICAgICAgICB0aGlzLnN0YXRlLm5leHQoKTtcbiAgICAgICAgdmFyIHkgPSB0aGlzLmxheWVycy5saXN0WzBdLmZvcndhcmQoaW5wLCB0aGlzLnN0YXRlLmF0KDApKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCB0aGlzLmxheWVycy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgeSA9IHRoaXMubGF5ZXJzLmxpc3RbaV0uZm9yd2FyZCh0aGlzLnN0YXRlLmF0KGkgLSAxKSwgdGhpcy5zdGF0ZS5hdChpKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geSAhPT0gdW5kZWZpbmVkID8geSA6IHRoaXMuc3RhdGUuYXQoLTEpLncuZDtcbiAgICB9O1xuXG4gICAgTmV0d29yay5wcm90b3R5cGUuYmFja3dhcmQgPSBmdW5jdGlvbihvdXRwKSB7XG4gICAgICAgIHZhciBFID0gZmFsc2UsIEkgPSB0aGlzLmxheWVycy5sZW5ndGggLSAyO1xuXG4gICAgICAgIHZhciBsb3NzID0gdGhpcy5sYXllcnMuYXQoLTEpLmJhY2t3YXJkKHRoaXMuc3RhdGUuYXQoLTEpLCB0aGlzLnN0YXRlLmF0KC0yKSwgb3V0cCk7XG4gICAgICAgIGZvciAodmFyIHQgPSAwOyB0IDwgdGhpcy5zdGF0ZS5oZWlnaHQgJiYgKEUgfHwgdCA9PT0gMCk7IHQrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IEk7IGkgPj0gMDsgaS0tKSB7IC8vIGFsd2F5cyBzdGFydCBiYWNrd2FyZCBwYXNzIGF0IGxhc3QgcmVjdXJyZW50IGxheWVyLCBvciBhdCBzZWNvbmQtbGFzdCBsYXllciBpZiB0PTBcblxuICAgICAgICAgICAgICAgIGlmKCFFICYmIHRoaXMubGF5ZXJzLmxpc3RbaV0ucmVjdXJyZW50KSB7IC8vIGV4cGFuZCBuZXR3b3JrXG4gICAgICAgICAgICAgICAgICAgIEUgPSB0cnVlLCBJID0gaTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLmxheWVycy5saXN0W2ldLmJhY2t3YXJkKHRoaXMuc3RhdGUuYXQoaSwgdCksIHRoaXMuc3RhdGUuYXQoaSAtIDEsIHQpKTtcblxuICAgICAgICAgICAgfSAgXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFkanVzdCgpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGxvc3M7XG4gICAgfTtcblxuICAgIE5ldHdvcmsucHJvdG90eXBlLmFkanVzdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoKyt0aGlzLnBhc3MgJSB0aGlzLmxlYXJuZXIuYmF0Y2ggIT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBtZXRob2QgPSB0aGlzLmdkW3RoaXMubGVhcm5lci5tZXRob2RdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMubGF5ZXJzLmxpc3RbaV0ucGFyYW1ldGVycyA9PT0gJ3VuZGVmaW5lZCcpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgIHZhciBwYXJhbSA9IHRoaXMubGF5ZXJzLmxpc3RbaV0ucGFyYW1ldGVycztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyYW0uZmlsdGVycyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBhcmFtLmZpbHRlcnMubGVuZ3RoOyBqKyspIHsgbWV0aG9kLmNhbGwodGhpcywgdGhpcy5sZWFybmVyLCBwYXJhbS5maWx0ZXJzW2pdLCAxLjApOyB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyYW0uYmlhc2VzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIG1ldGhvZC5jYWxsKHRoaXMsIHRoaXMubGVhcm5lciwgcGFyYW0uYmlhc2VzLCAwLjApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qIGdyYWRpZW50IGRlc2NlbnQgYWxnb3JpdGhtcyAqL1xuICAgIE5ldHdvcmsucHJvdG90eXBlLmdkID0ge307XG5cbiAgICBOZXR3b3JrLnByb3RvdHlwZS5nZC5zZ2QgPSB7XG4gICAgICAgIGRlZmF1bHRzOiB7XG4gICAgICAgICAgICByYXRlOiAwLjAxLFxuICAgICAgICAgICAgbW9tZW50dW06IDAuOVxuICAgICAgICB9LFxuICAgICAgICBzdG9yYWdlOiBbJ2dzdW0nXSxcbiAgICAgICAgYWxnb3JpdGhtOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGR4ID0gb3B0Lm1vbWVudHVtICogZ3N1bSAtIG9wdC5yYXRlICogZ2lqO1xuICAgICAgICAgICAgZ3N1bSA9IGR4O1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIE5ldHdvcmsucHJvdG90eXBlLmdkLmFkYWRlbHRhID0ge1xuICAgICAgICBkZWZhdWx0czoge1xuICAgICAgICAgICAgcm86IDAuOTUsXG4gICAgICAgICAgICBlcHM6IDFlLThcbiAgICAgICAgfSxcbiAgICAgICAgc3RvcmFnZTogWydnc3VtJywgJ3hzdW0nXSxcbiAgICAgICAgYWxnb3JpdGhtOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGdzdW0gPSBvcHQucm8gKiBnc3VtICsgKDEgLSBvcHQucm8pICogZ2lqICogZ2lqO1xuICAgICAgICAgICAgZHggPSAtTWF0aC5zcXJ0KCh4c3VtICsgb3B0LmVwcykgLyAoZ3N1bSArIG9wdC5lcHMpKSAqIGdpajtcbiAgICAgICAgICAgIHhzdW0gPSBvcHQucm8gKiB4c3VtICsgKDEgLSBvcHQucm8pICogZHggKiBkeDsgLy8geWVzLCB4c3VtIGxhZ3MgYmVoaW5kIGdzdW0gYnkgMS5cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKiBhbGdvcml0aG1zIGNvbXBpbGVyLCBzcGVlZHMgdGhpbmdzIHVwLCBhbmQgbWFrZXMgdGhpbmdzIGVhc2llciAqL1xuICAgIChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGdkX3Byb3RvdHlwZSA9IGZ1bmN0aW9uKG9wdCwgTywgZGVjYXkpIHtcbiAgICAgICAgICAgIGlmIChPLm5vY2hhbmdlKSByZXR1cm47XG4gICAgICAgICAgICB2YXIgZHggPSAwLCBfX2dyYWQgPSAwLCBnaWogPSAwLCBsMWdyYWQgPSAwLCBsMmdyYWQgPSAwO1xuICAgICAgICAgICAgXCJVVTFcIjtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgTy5zaXplLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgX19ncmFkID0gTy5kdy5kW2ldO1xuICAgICAgICAgICAgICAgIF9fZ3JhZCA9IF9fZ3JhZCA+IG9wdC5jbGlwID8gb3B0LmNsaXAgOiAoX19ncmFkIDwgLW9wdC5jbGlwID8gLW9wdC5jbGlwIDogX19ncmFkKTtcbiAgICAgICAgICAgICAgICBsMWdyYWQgPSBkZWNheSAqIG9wdC5kZWNheS5sMSAqIChPLncuZFtpXSA+IDAgPyAxIDogLTEpO1xuICAgICAgICAgICAgICAgIGwyZ3JhZCA9IGRlY2F5ICogb3B0LmRlY2F5LmwyICogKE8udy5kW2ldKTtcbiAgICAgICAgICAgICAgICBnaWogPSAoX19ncmFkICsgbDFncmFkICsgbDJncmFkKSAvIG9wdC5iYXRjaDtcbiAgICAgICAgICAgICAgICBcIlVVMlwiO1xuICAgICAgICAgICAgICAgIFwiVVUzXCI7XG4gICAgICAgICAgICAgICAgXCJVVTRcIjtcbiAgICAgICAgICAgICAgICBPLncuZFtpXSArPSBkeDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgTy5kdy5hbGwoMC4wKTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgZ2RfcHJvdG90eXBlXyA9IGdkX3Byb3RvdHlwZS50b1N0cmluZygpO1xuXG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gTmV0d29yay5wcm90b3R5cGUuZ2QpIHtcbiAgICAgICAgICAgIHZhciBkZXNjcmlwdGlvbiA9IE5ldHdvcmsucHJvdG90eXBlLmdkW25hbWVdO1xuICAgICAgICAgICAgdmFyIGNoZWNrcyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkZXNjcmlwdGlvbi5zdG9yYWdlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY2hlY2tzW2ldID0gJ2lmICh0eXBlb2YgTy4nICsgZGVzY3JpcHRpb24uc3RvcmFnZVtpXSArICcgPT09IFwidW5kZWZpbmVkXCIpIHsgTy4nICsgZGVzY3JpcHRpb24uc3RvcmFnZVtpXSArICcgPSBuZXcgbGliLk1hdChPLnNpemUueCwgTy5zaXplLnksIE8uc2l6ZS5kZXB0aCwgMC4wKTsgfSc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBleHRyYWN0aW9ucyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkZXNjcmlwdGlvbi5zdG9yYWdlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZXh0cmFjdGlvbnNbaV0gPSAndmFyICcgKyBkZXNjcmlwdGlvbi5zdG9yYWdlW2ldICsgJyA9IE8uJyArIGRlc2NyaXB0aW9uLnN0b3JhZ2VbaV0gKyAnLmRbaV07JztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGFsZyA9IGRlc2NyaXB0aW9uLmFsZ29yaXRobS50b1N0cmluZygpO1xuICAgICAgICAgICAgYWxnID0gYWxnLnN1YnN0cmluZyhhbGcuaW5kZXhPZigneycpICsgMSwgYWxnLmxlbmd0aCAtIDEpO1xuXG4gICAgICAgICAgICB2YXIgc3RvcmluZ3MgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGVzY3JpcHRpb24uc3RvcmFnZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHN0b3JpbmdzW2ldID0gJ08uJyArIGRlc2NyaXB0aW9uLnN0b3JhZ2VbaV0gKyAnLmRbaV0gPSAnICsgZGVzY3JpcHRpb24uc3RvcmFnZVtpXSArICc7JztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGZ1bmMgPSBnZF9wcm90b3R5cGVfLnJlcGxhY2UoJ1wiVVUxXCI7JywgY2hlY2tzLmpvaW4oXCJcIikpLnJlcGxhY2UoJ1wiVVUyXCI7JywgZXh0cmFjdGlvbnMuam9pbihcIlwiKSkucmVwbGFjZSgnXCJVVTNcIjsnLCBhbGcpLnJlcGxhY2UoJ1wiVVU0XCI7Jywgc3RvcmluZ3Muam9pbihcIlwiKSk7XG4gICAgICAgICAgICB2YXIgY21kID0gJ05ldHdvcmsucHJvdG90eXBlLmdkLicgKyBuYW1lICsgJyA9ICcgKyBmdW5jO1xuICAgICAgICAgICAgZXZhbChjbWQpO1xuICAgICAgICAgICAgTmV0d29yay5wcm90b3R5cGUuZ2RbbmFtZV0uZGVmYXVsdHMgPSBkZXNjcmlwdGlvbi5kZWZhdWx0cztcbiAgICAgICAgfVxuICAgIH0pKCk7XG5cbiAgICBsaWIuTmV0d29yayA9IE5ldHdvcms7XG59KShubmpzKTtcbiIsIihmdW5jdGlvbiAobGliKSB7IFwidXNlIHN0cmljdFwiO1xuXG5cdC8qIHNwYXRpYWwgd2VpZ2h0cyAqL1xuXHRmdW5jdGlvbiBDb252b2x1dGlvbmFsTGF5ZXIob3B0KSB7XG5cdFx0dGhpcy5pbiA9IG9wdC5pbnB1dDtcblx0XHR0aGlzLmZpbHRlciA9IG9wdC5maWx0ZXI7XG5cdFx0dGhpcy5zdHJpZGUgPSBvcHQuc3RyaWRlO1xuXHRcdHRoaXMucGFkID0gb3B0LnBhZDtcblxuXHRcdHZhciBveCA9IE1hdGguZmxvb3IoKHRoaXMuaW4ueCArIHRoaXMucGFkICogMiAtIHRoaXMuZmlsdGVyLngpIC8gdGhpcy5zdHJpZGUgKyAxKTtcblx0XHR2YXIgb3kgPSBNYXRoLmZsb29yKCh0aGlzLmluLnkgKyB0aGlzLnBhZCAqIDIgLSB0aGlzLmZpbHRlci55KSAvIHRoaXMuc3RyaWRlICsgMSk7XG5cdFx0dGhpcy5vdXQgPSBsaWIuU2l6ZTMob3gsIG95LCB0aGlzLmZpbHRlci5kZXB0aCk7XG5cblx0XHR0aGlzLnBhcmFtZXRlcnMgPSB7XG5cdFx0XHRmaWx0ZXJzOiBbXSxcblx0XHRcdGJpYXNlczogbmV3IGxpYi5CbG9iKDEsIDEsIHRoaXMuZmlsdGVyLmRlcHRoLCAwLjApXG5cdFx0fTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5vdXQuZGVwdGg7IGkrKykge1xuXHRcdFx0dGhpcy5wYXJhbWV0ZXJzLmZpbHRlcnNbaV0gPSBuZXcgbGliLkJsb2IodGhpcy5maWx0ZXIueCwgdGhpcy5maWx0ZXIueSwgdGhpcy5pbi5kZXB0aCk7XG5cdFx0fVxuXHR9O1xuXG5cdENvbnZvbHV0aW9uYWxMYXllci5wcm90b3R5cGUuZm9yd2FyZCA9IGZ1bmN0aW9uIChWLCBBKSB7XG5cdFx0dmFyIEFfeCA9IEEuc2l6ZS54IHwgMCwgQV95ID0gQS5zaXplLnkgfCAwLCBBX2QgPSBBLnNpemUuZGVwdGggfCAwO1xuXHRcdHZhciBWX3ggPSBWLnNpemUueCB8IDAsIFZfeSA9IFYuc2l6ZS55IHwgMCwgVl9kID0gVi5zaXplLmRlcHRoIHwgMDtcblx0XHR2YXIgRl94ID0gdGhpcy5maWx0ZXIueCB8IDAsIEZfeSA9IHRoaXMuZmlsdGVyLnkgfCAwLCBGX2QgPSB0aGlzLmZpbHRlci5kZXB0aCB8IDA7XG5cblx0XHR2YXIgc3RyaWRlID0gdGhpcy5zdHJpZGUgfCAwO1xuXHRcdHZhciBiaWFzZXMgPSB0aGlzLnBhcmFtZXRlcnMuYmlhc2VzLncuZDtcblxuXHRcdGZvciAodmFyIGQgPSAwOyBkIDwgQV9kOyBkKyspIHtcblx0XHQgICAgdmFyIGYgPSB0aGlzLnBhcmFtZXRlcnMuZmlsdGVyc1tkXTtcblx0XHQgICAgdmFyIHggPSAtdGhpcy5wYWQgfCAwO1xuXHRcdCAgICB2YXIgeSA9IC10aGlzLnBhZCB8IDA7XG5cdFx0ICAgIGZvciAodmFyIGF5ID0gMDsgYXkgPCBBX3k7IHkgKz0gc3RyaWRlLCBheSsrKSB7IC8vIHh5X3N0cmlkZVxuXHRcdCAgICAgICAgeCA9IC10aGlzLnBhZCB8IDA7XG5cdFx0ICAgICAgICBmb3IgKHZhciBheCA9IDA7IGF4IDwgQV94OyB4ICs9IHN0cmlkZSwgYXgrKykgeyAvLyB4eV9zdHJpZGVcblxuXHRcdCAgICAgICAgICAgIC8vIGNvbnZvbHZlIGNlbnRlcmVkIGF0IHRoaXMgcGFydGljdWxhciBsb2NhdGlvbiBbYXgsIGF5XVxuXHRcdCAgICAgICAgICAgIHZhciBhID0gMC4wO1xuXHRcdCAgICAgICAgICAgIHZhciBveCA9IDAsIG95ID0gMDtcblx0XHQgICAgICAgICAgICBmb3IgKHZhciBmeSA9IDA7IGZ5IDwgRl95OyBmeSsrKSB7XG5cdFx0ICAgICAgICAgICAgICAgIG95ID0geSArIGZ5OyAvLyBjb29yZGluYXRlcyBpbiB0aGUgb3JpZ2luYWwgaW5wdXQgYXJyYXkgY29vcmRpbmF0ZXNcblx0XHQgICAgICAgICAgICAgICAgZm9yICh2YXIgZnggPSAwOyBmeCA8IEZfeDsgZngrKykge1xuXHRcdCAgICAgICAgICAgICAgICAgICAgb3ggPSB4ICsgZng7XG5cdFx0ICAgICAgICAgICAgICAgICAgICBpZiAob3kgPj0gMCAmJiBveSA8IFZfeSAmJiBveCA+PSAwICYmIG94IDwgVl94KSB7XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgZmQgPSAwOyBmZCA8IEZfZDsgZmQrKykge1xuXHRcdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBLndbYXgsIGF5LCBkXSArPSBmLndbIGZ4LCBmeSwgZmQgXSAqIFYud1sgb3gsIG95LCBmZCBdXG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEgKz0gZi53LmRbKGZ5ICogRl94ICsgZngpICogRl9kICsgZmRdICogVi53LmRbKG95ICogVl94ICsgb3gpICogVl9kICsgZmRdO1xuXHRcdCAgICAgICAgICAgICAgICAgICAgICAgIH1cblx0XHQgICAgICAgICAgICAgICAgICAgIH1cblx0XHQgICAgICAgICAgICAgICAgfVxuXHRcdCAgICAgICAgICAgIH1cblxuXHRcdCAgICAgICAgICAgIEEudy5kWyhheSAqIEFfeCArIGF4KSAqIEFfZCArIGRdID0gYSArIGJpYXNlc1tkXTtcblx0XHQgICAgICAgIH1cblx0XHQgICAgfVxuXHRcdH1cblx0fTtcblxuXHRDb252b2x1dGlvbmFsTGF5ZXIucHJvdG90eXBlLmJhY2t3YXJkID0gZnVuY3Rpb24gKEEsIFYpIHtcblx0XHR2YXIgQV94ID0gQS5zaXplLnggfCAwLCBBX3kgPSBBLnNpemUueSB8IDAsIEFfZCA9IEEuc2l6ZS5kZXB0aCB8IDA7XG5cdFx0dmFyIFZfeCA9IFYuc2l6ZS54IHwgMCwgVl95ID0gVi5zaXplLnkgfCAwLCBWX2QgPSBWLnNpemUuZGVwdGggfCAwO1xuXHRcdHZhciBGX3ggPSB0aGlzLmZpbHRlci54IHwgMCwgRl95ID0gdGhpcy5maWx0ZXIueSB8IDAsIEZfZCA9IHRoaXMuZmlsdGVyLmRlcHRoIHwgMDtcblxuXHRcdHZhciBzdHJpZGUgPSB0aGlzLnN0cmlkZSB8IDA7XG5cdFx0dmFyIGJpYXNlcyA9IHRoaXMucGFyYW1ldGVycy5iaWFzZXMuZHcuZDtcblxuXHRcdHZhciB2MSA9IDAsIHYyID0gMDtcblxuXHRcdGZvciAodmFyIGQgPSAwOyBkIDwgQV9kOyBkKyspIHtcblx0XHQgICAgdmFyIGYgPSB0aGlzLnBhcmFtZXRlcnMuZmlsdGVyc1tkXTtcblx0XHQgICAgdmFyIHggPSAtdGhpcy5wYWQgfCAwO1xuXHRcdCAgICB2YXIgeSA9IC10aGlzLnBhZCB8IDA7XG5cdFx0ICAgIGZvciAodmFyIGF5ID0gMDsgYXkgPCBBX3k7IHkgKz0gc3RyaWRlLCBheSsrKSB7XG5cdFx0ICAgICAgICB4ID0gLXRoaXMucGFkIHwgMDtcblx0XHQgICAgICAgIGZvciAodmFyIGF4ID0gMDsgYXggPCBBX3g7IHggKz0gc3RyaWRlLCBheCsrKSB7XG5cblx0XHQgICAgICAgICAgICAvLyBjb252b2x2ZSBjZW50ZXJlZCBhdCB0aGlzIGxvY2F0aW9uIFtheCwgYXldXG5cdFx0ICAgICAgICAgICAgdmFyIGRBID0gQS5kdy5kWyhheSAqIEFfeCArIGF4KSAqIEFfZCArIGRdO1xuXHRcdCAgICAgICAgICAgIHZhciBveCA9IDAsIG95ID0gMDtcblx0XHQgICAgICAgICAgICBmb3IgKHZhciBmeSA9IDA7IGZ5IDwgRl95OyBmeSsrKSB7XG5cdFx0ICAgICAgICAgICAgICAgIG95ID0geSArIGZ5OyAvLyBjb29yZGluYXRlcyBpbiB0aGUgb3JpZ2luYWwgaW5wdXQgYXJyYXkgY29vcmRpbmF0ZXNcblx0XHQgICAgICAgICAgICAgICAgZm9yICh2YXIgZnggPSAwOyBmeCA8IEZfeDsgZngrKykge1xuXHRcdCAgICAgICAgICAgICAgICAgICAgb3ggPSB4ICsgZng7XG5cdFx0ICAgICAgICAgICAgICAgICAgICBpZiAob3kgPj0gMCAmJiBveSA8IFZfeSAmJiBveCA+PSAwICYmIG94IDwgVl94KSB7XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgZmQgPSAwOyBmZCA8IEZfZDsgZmQrKykge1xuXHRcdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBmLmR3W2Z4LCBmeSwgZmRdICs9IFYud1tveCwgb3ksIGZkXSAqIEEuZHdbYXgsIGF5LCBkXVxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gVi5kd1tveCwgb3ksIGZkXSArPSBmLndbZngsIGZ5LCBmZF0gKiBBLmR3W2F4LCBheSwgZF1cblx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgdjEgPSAoZnkgKiBGX3ggKyBmeCkgKiBGX2QgKyBmZDtcblx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgdjIgPSAob3kgKiBWX3ggKyBveCkgKiBWX2QgKyBmZDtcblx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgZi5kdy5kW3YxXSArPSBWLncuZFt2Ml0qZEE7XG5cdCAgICAgICAgICAgICAgICAgICAgXHRcdFx0Vi5kdy5kW3YyXSArPSBmLncuZFt2MV0qZEE7XG5cdFx0ICAgICAgICAgICAgICAgICAgICAgICAgfVxuXHRcdCAgICAgICAgICAgICAgICAgICAgfVxuXHRcdCAgICAgICAgICAgICAgICB9XG5cdFx0ICAgICAgICAgICAgfVxuXG5cdFx0ICAgICAgICAgICAgYmlhc2VzW2RdICs9IGRBO1xuXHRcdCAgICAgICAgfVxuXHRcdCAgICB9XG5cdFx0fVxuXHR9O1xuXG5cdC8qIFBvb2xpbmcgbGF5ZXIsIHNlbGVjdCBiaWdnZXN0IHZhbHVlIGZyb20gY29udm9sdXRpb24gKi9cblx0ZnVuY3Rpb24gUG9vbGluZ0xheWVyKG9wdCkge1xuXHRcdHRoaXMuaW4gPSBvcHQuaW5wdXQ7XG5cdFx0dGhpcy5maWx0ZXIgPSBvcHQuZmlsdGVyO1xuXHRcdHRoaXMuc3RyaWRlID0gb3B0LnN0cmlkZTtcblx0XHR0aGlzLnBhZCA9IG9wdC5wYWQ7XG5cblx0XHR2YXIgb3ggPSBNYXRoLmZsb29yKCh0aGlzLmluLnggKyB0aGlzLnBhZCAqIDIgLSB0aGlzLmZpbHRlci54KSAvIHRoaXMuc3RyaWRlICsgMSk7XG5cdFx0dmFyIG95ID0gTWF0aC5mbG9vcigodGhpcy5pbi55ICsgdGhpcy5wYWQgKiAyIC0gdGhpcy5maWx0ZXIueSkgLyB0aGlzLnN0cmlkZSArIDEpO1xuXHRcdHRoaXMub3V0ID0gbGliLlNpemUzKG94LCBveSwgdGhpcy5pbi5kZXB0aCk7XG5cdH07XG5cblx0UG9vbGluZ0xheWVyLnByb3RvdHlwZS5mb3J3YXJkID0gZnVuY3Rpb24gKFYsIEEpIHtcblx0XHR2YXIgQV94ID0gQS5zaXplLnggfCAwLCBBX3kgPSBBLnNpemUueSB8IDAsIEFfZCA9IEEuc2l6ZS5kZXB0aCB8IDA7XG5cdFx0dmFyIFZfeCA9IFYuc2l6ZS54IHwgMCwgVl95ID0gVi5zaXplLnkgfCAwLCBWX2QgPSBWLnNpemUuZGVwdGggfCAwO1xuXHRcdHZhciBGX3ggPSB0aGlzLmZpbHRlci54IHwgMCwgRl95ID0gdGhpcy5maWx0ZXIueSB8IDA7IFxuXG5cdFx0dmFyIHN0cmlkZSA9IHRoaXMuc3RyaWRlIHwgMDtcblxuXHRcdGZvciAodmFyIGQgPSAwOyBkIDwgQV9kOyBkKyspIHtcblx0XHQgICAgdmFyIHggPSAtdGhpcy5wYWQgfCAwO1xuXHRcdCAgICB2YXIgeSA9IC10aGlzLnBhZCB8IDA7XG5cdFx0ICAgIGZvciAodmFyIGF5ID0gMDsgYXkgPCBBX3k7IHkgKz0gc3RyaWRlLCBheSsrKSB7XG5cdFx0ICAgICAgICB4ID0gLXRoaXMucGFkIHwgMDtcblx0XHQgICAgICAgIGZvciAodmFyIGF4ID0gMDsgYXggPCBBX3g7IHggKz0gc3RyaWRlLCBheCsrKSB7XG5cblx0XHQgICAgICAgICAgICAvLyBjb252b2x2ZSBjZW50ZXJlZCBhdCB0aGlzIGxvY2F0aW9uIFtheCwgYXldXG5cdFx0ICAgICAgICAgICAgdmFyIHNlbHYgPSAtTWF0aC5JbmZpbml0eSwgc2VseCA9IDAsIHNlbHk7XG5cdFx0ICAgICAgICAgICAgdmFyIG94ID0gMCwgb3kgPSAwLCBxID0gMDtcblx0XHQgICAgICAgICAgICBmb3IgKHZhciBmeSA9IDA7IGZ5IDwgRl95OyBmeSsrKSB7XG5cdFx0ICAgICAgICAgICAgICAgIG95ID0geSArIGZ5OyAvLyBjb29yZGluYXRlcyBpbiB0aGUgb3JpZ2luYWwgaW5wdXQgYXJyYXkgY29vcmRpbmF0ZXNcblx0XHQgICAgICAgICAgICAgICAgZm9yICh2YXIgZnggPSAwOyBmeCA8IEZfeDsgZngrKykge1xuXHRcdCAgICAgICAgICAgICAgICAgICAgb3ggPSB4ICsgZng7XG5cdFx0ICAgICAgICAgICAgICAgICAgICBpZiAob3kgPj0gMCAmJiBveSA8IFZfeSAmJiBveCA+PSAwICYmIG94IDwgVl94KSB7XG5cdFx0ICAgICAgICAgICAgICAgICAgICBcdHEgPSBWLncuZFsob3kgKiBWX3ggKyBveCkgKiBWX2QgKyBkXTtcblx0XHQgICAgICAgICAgICAgICAgICAgIFx0aWYgKHEgPiBzZWx2KSB7IHNlbHYgPSBxOyBzZWx4ID0gb3g7IHNlbHkgPSBveTsgfVxuXHRcdCAgICAgICAgICAgICAgICAgICAgfVxuXHRcdCAgICAgICAgICAgICAgICB9XG5cdFx0ICAgICAgICAgICAgfVxuXG5cdFx0ICAgICAgICAgICAgdmFyIGl4ID0gKGF5ICogQV94ICsgYXgpICogQV9kICsgZDtcblx0XHQgICAgICAgICAgICBBLnB4W2l4XSA9IHNlbHg7XG5cdFx0ICAgICAgICAgICAgQS5weVtpeF0gPSBzZWx5O1xuXHRcdCAgICAgICAgICAgIEEudy5kW2l4XSA9IHNlbHY7XG5cdFx0ICAgICAgICB9XG5cdFx0ICAgIH1cblx0XHR9XG5cdH07XG5cblx0UG9vbGluZ0xheWVyLnByb3RvdHlwZS5iYWNrd2FyZCA9IGZ1bmN0aW9uIChBLCBWKSB7XG5cdFx0dmFyIEFfeCA9IEEuc2l6ZS54IHwgMCwgQV95ID0gQS5zaXplLnkgfCAwLCBBX2QgPSBBLnNpemUuZGVwdGggfCAwO1xuXHRcdHZhciBWX3ggPSBWLnNpemUueCB8IDAsIFZfeSA9IFYuc2l6ZS55IHwgMCwgVl9kID0gVi5zaXplLmRlcHRoIHwgMDtcblx0XHR2YXIgRl94ID0gdGhpcy5maWx0ZXIueCB8IDAsIEZfeSA9IHRoaXMuZmlsdGVyLnkgfCAwOyBcblxuXHRcdHZhciBzdHJpZGUgPSB0aGlzLnN0cmlkZSB8IDA7XG5cblx0XHRmb3IgKHZhciBkID0gMDsgZCA8IEFfZDsgZCsrKSB7XG5cdFx0ICAgIGZvciAodmFyIGF5ID0gMDsgYXkgPCBBX3k7IGF5KyspIHtcblx0XHQgICAgICAgIGZvciAodmFyIGF4ID0gMDsgYXggPCBBX3g7IGF4KyspIHtcblx0XHQgICAgICAgIFx0dmFyIGl4ID0gKGF5ICogQV94ICsgYXgpICogQV9kICsgZDtcblx0XHQgICAgICAgIFx0dmFyIGRBID0gQS5kdy5kW2l4XTtcblxuXHRcdCAgICAgICAgXHR2YXIgc2VseCA9IEEucHhbaXhdOyBcblx0XHQgICAgICAgIFx0dmFyIHNlbHkgPSBBLnB5W2l4XTtcblxuXHRcdCAgICAgICAgXHRWLmR3LmRbKHNlbHkgKiBWX3ggKyBzZWx4KSAqIFZfZCArIGRdID0gZEE7IC8vIG9ubHkgdHJhbnNmZXIgd2VpZ2h0cyBmcm9tIHNlbGVjdGVkIGxvY2F0aW9uc1xuXHRcdCAgICAgICAgfVxuXHRcdCAgICB9XG5cdFx0fVxuXHR9O1xuXG5cdFBvb2xpbmdMYXllci5wcm90b3R5cGUuUHJlcGFyZVN0YXRlQmxvYiA9IGZ1bmN0aW9uIChBKSB7XG5cdFx0QS5weCA9IGxpYi5NYXQuQ3JlYXRlQXJyYXkodGhpcy5vdXQuZGVwdGggKiB0aGlzLm91dC55ICogdGhpcy5vdXQueCwgMCwgJ1VpbnQxNkFycmF5Jyk7XG5cdFx0QS5weSA9IGxpYi5NYXQuQ3JlYXRlQXJyYXkodGhpcy5vdXQuZGVwdGggKiB0aGlzLm91dC55ICogdGhpcy5vdXQueCwgMCwgJ1VpbnQxNkFycmF5Jyk7XG5cdH07XG5cblx0bGliLkNvbnZvbHV0aW9uYWxMYXllciA9IENvbnZvbHV0aW9uYWxMYXllcjtcblx0bGliLlBvb2xpbmdMYXllciA9IFBvb2xpbmdMYXllcjtcbn0pKG5uanMpOyIsIihmdW5jdGlvbiAobGliKSB7IFwidXNlIHN0cmljdFwiO1xuXHQvKipcblx0ICogQHBhcmFtIHtvYmplY3R9IGlucHV0LCBzaXplXG5cdCAqL1xuXHRmdW5jdGlvbiBEb3RMYXllcihvcHQpIHtcblx0XHR0aGlzLmluID0gb3B0LmlucHV0O1xuXHRcdHRoaXMub3V0ID0gbGliLlNpemUzKDEsIDEsIG9wdC5zaXplKTtcblx0XHR0aGlzLnBhcmFtZXRlcnMgPSB7XG5cdFx0XHRmaWx0ZXJzOiBbXSxcblx0XHRcdGJpYXNlczogbmV3IGxpYi5CbG9iKDEsIDEsIHRoaXMub3V0LmRlcHRoLCAwLjApXG5cdFx0fTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5vdXQubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMucGFyYW1ldGVycy5maWx0ZXJzW2ldID0gbmV3IGxpYi5CbG9iKDEsIDEsIHRoaXMuaW4ubGVuZ3RoKTtcblx0XHR9XG5cdH07XG5cblx0RG90TGF5ZXIucHJvdG90eXBlLmZvcndhcmQgPSBmdW5jdGlvbiAoViwgQSkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5vdXQubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBzdW0gPSAwLjA7XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMuaW4ubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0c3VtICs9IFYudy5kW2pdICogdGhpcy5wYXJhbWV0ZXJzLmZpbHRlcnNbaV0udy5kW2pdO1xuXHRcdFx0fVxuXG5cdFx0XHRBLncuZFtpXSA9IHN1bSArIHRoaXMucGFyYW1ldGVycy5iaWFzZXMudy5kW2ldO1xuXHRcdH1cblx0fTtcblxuXHREb3RMYXllci5wcm90b3R5cGUuYmFja3dhcmQgPSBmdW5jdGlvbiAoQSwgVikge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5vdXQubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBkQSA9IEEuZHcuZFtpXTtcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5pbi5sZW5ndGg7IGorKykge1xuXHRcdFx0XHR0aGlzLnBhcmFtZXRlcnMuZmlsdGVyc1tpXS5kdy5kW2pdICs9IFYudy5kW2pdICogZEE7XG5cdFx0XHRcdFYuZHcuZFtqXSArPSB0aGlzLnBhcmFtZXRlcnMuZmlsdGVyc1tpXS53LmRbal0gKiBkQTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5wYXJhbWV0ZXJzLmJpYXNlcy5kdy5kW2ldICs9IGRBO1xuXHRcdH1cblx0fTtcblxuXHRsaWIuRG90TGF5ZXIgPSBEb3RMYXllcjtcbn0pKG5uanMpOyIsIihmdW5jdGlvbiAobGliKSB7IFwidXNlIHN0cmljdFwiO1xuXG5cdGZ1bmN0aW9uIERyb3BPdXRMYXllcihvcHQsIG5ldCkge1xuXHRcdHRoaXMuaW4gPSBvcHQuaW5wdXQ7XG5cdFx0dGhpcy5vdXQgPSBvcHQuaW5wdXQ7XG5cdFx0dGhpcy5uZXQgPSBuZXQ7XG5cdFx0dGhpcy5wcm9iYWJpbGl0eSA9IG9wdC5wcm9iYWJpbGl0eSB8fCAwLjI1O1xuXHR9XG5cblx0RHJvcE91dExheWVyLnByb3RvdHlwZS5mb3J3YXJkID0gZnVuY3Rpb24gKFYsIEEpIHtcblx0XHRpZiAoIXRoaXMubmV0LndlYWspIHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pbi5sZW5ndGg7IGkrKykgeyBBLncuZFtpXSA9IFYudy5kW2ldICogdGhpcy5wcm9iYWJpbGl0eTsgfSByZXR1cm4gO1xuXHRcdH1cblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pbi5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKE1hdGgucmFuZG9tKCkgPCB0aGlzLnByb2JhYmlsaXR5KSB7XG5cdFx0XHRcdEEudy5kW2ldID0gMC4wO1xuXHRcdFx0XHRBLmRyb3BwZWRPdXRbaV0gPSB0cnVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0QS53LmRbaV0gPSBWLncuZFtpXTtcblx0XHRcdFx0QS5kcm9wcGVkT3V0W2ldID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdERyb3BPdXRMYXllci5wcm90b3R5cGUuYmFja3dhcmQgPSBmdW5jdGlvbiAoQSwgVikge1xuXHRcdGlmICghdGhpcy5uZXQud2VhayB8fCBBLmRyb3BwZWRPdXQubGVuZ3RoICE9PSB0aGlzLmluLmxlbmd0aCkgcmV0dXJuIDtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pbi5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYoIUEuZHJvcHBlZE91dFtpXSkge1xuXHRcdFx0XHRWLmR3LmRbaV0gPSBBLmR3LmRbaV07XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdERyb3BPdXRMYXllci5wcm90b3R5cGUuUHJlcGFyZVN0YXRlQmxvYiA9IGZ1bmN0aW9uIChBKSB7XG5cdFx0QS5kcm9wcGVkT3V0ID0gW107XG5cdH07XG5cblx0bGliLkRyb3BPdXRMYXllciA9IERyb3BPdXRMYXllcjtcblx0XG59KShubmpzKTsiLCIoZnVuY3Rpb24obGliKSB7IFwidXNlIHN0cmljdFwiO1xuXG4gICAgZnVuY3Rpb24gSW5wdXRMYXllcihvcHQpIHtcbiAgICAgICAgdGhpcy5vdXQgPSBvcHQuc2l6ZTtcbiAgICAgICAgdGhpcy5zY2FsZSA9IG9wdC5zY2FsZSB8fCAxLjA7XG4gICAgICAgIHRoaXMuYmlhcyA9IG9wdC5iaWFzIHx8IDAuMDtcbiAgICB9O1xuXG4gICAgSW5wdXRMYXllci5wcm90b3R5cGUuZm9yd2FyZCA9IGZ1bmN0aW9uKFYsIEEpIHtcbiAgICAgICAgQS53LmNvcHkoViwgdGhpcy5zY2FsZSwgdGhpcy5iaWFzKTtcbiAgICB9O1xuXG4gICAgSW5wdXRMYXllci5wcm90b3R5cGUuYmFja3dhcmQgPSBmdW5jdGlvbihBLCBWKSB7fTtcblxuICAgIGxpYi5JbnB1dExheWVyID0gSW5wdXRMYXllcjtcbn0pKG5uanMpO1xuIiwiKGZ1bmN0aW9uKGxpYikge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgZnVuY3Rpb24gc2lnbSh4KSB7XG4gICAgICAgIHJldHVybiAxLjAgLyAoMS4wICsgTWF0aC5leHAoLXgpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkc2lnbSh5KSB7XG4gICAgICAgIHJldHVybiB5ICogKDEgLSB5KTtcbiAgICB9XG5cbiAgICAvLyBzZWUgaHR0cDovL3Blb3BsZS5pZHNpYS5jaC9+anVlcmdlbi9sc3RtL3NsZDAxOS5odG1cbiAgICBmdW5jdGlvbiBMb25nU2hvcnRUZXJtTWVtb3J5TGF5ZXIob3B0KSB7XG4gICAgICAgIHRoaXMuaW4gPSBvcHQuaW5wdXQ7XG4gICAgICAgIHRoaXMub3V0ID0gb3B0LmlucHV0OyAvLyAxIHRvIDEgbWFwcGluZ1xuXG4gICAgICAgIHRoaXMucmVjdXJyZW50ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wYXJhbWV0ZXJzID0ge1xuICAgICAgICAgICAgZmlsdGVyczogW10sXG4gICAgICAgICAgICBiaWFzZXM6IG5ldyBsaWIuQmxvYigxLCAxLCB0aGlzLm91dC5kZXB0aCwgMC4wKVxuICAgICAgICB9O1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5wYXJhbWV0ZXJzLmZpbHRlcnNbaV0gPSBuZXcgbGliLkJsb2IoMSwgMSwgOSwgMCwgMC4wOCk7XG4gICAgICAgICAgICB0aGlzLnBhcmFtZXRlcnMuZmlsdGVyc1tpXS53LmRbMl0gPSAtMTsgLy8gYXQgYmVnaW5uaW5nIG5lZ2F0aXZlIHBlZXBob2xlIGNvbm5lY3Rpb25zXG4gICAgICAgICAgICB0aGlzLnBhcmFtZXRlcnMuZmlsdGVyc1tpXS53LmRbNV0gPSAtMTsgLy8gdG8gbWluaW1pemUgZXhwbG9kaW5nXG4gICAgICAgICAgICB0aGlzLnBhcmFtZXRlcnMuZmlsdGVyc1tpXS53LmRbOF0gPSAtMTsgLy8gY2VsbCBzdGF0ZVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wYXJhbWV0ZXJzLmJpYXNlcyA9IG5ldyBsaWIuQmxvYigxLCB0aGlzLmluLmxlbmd0aCwgMywgMC4wKTtcbiAgICB9O1xuXG4gICAgTG9uZ1Nob3J0VGVybU1lbW9yeUxheWVyLnByb3RvdHlwZS5mb3J3YXJkID0gZnVuY3Rpb24oViwgQSkge1xuICAgICAgICB2YXIgYmlhcyA9IHRoaXMucGFyYW1ldGVycy5iaWFzZXMudy5kO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMub3V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcGFyYW0gPSB0aGlzLnBhcmFtZXRlcnMuZmlsdGVyc1tpXS53LmQ7XG5cbiAgICAgICAgICAgIHZhciB4ID0gVi53LmRbaV07XG4gICAgICAgICAgICB2YXIgaF8gPSBBLnByZXYudy5kW2ldO1xuICAgICAgICAgICAgdmFyIGNfID0gQS5wcmV2LmxzdG0uY2VsbHMudy5kW2ldO1xuXG4gICAgICAgICAgICB2YXIgaWcgPSBzaWdtKHggKiBwYXJhbVswXSArIGhfICogcGFyYW1bMV0gKyBjXyAqIHBhcmFtWzJdICsgYmlhc1tpICogMyArIDBdKTtcbiAgICAgICAgICAgIHZhciBmZyA9IHNpZ20oeCAqIHBhcmFtWzNdICsgaF8gKiBwYXJhbVs0XSArIGNfICogcGFyYW1bNV0gKyBiaWFzW2kgKiAzICsgMV0pO1xuICAgICAgICAgICAgdmFyIGMgPSBpZyAqIHggKyBmZyAqIGNfO1xuICAgICAgICAgICAgdmFyIG9nID0gc2lnbSh4ICogcGFyYW1bNl0gKyBoXyAqIHBhcmFtWzddICsgYyAgKiBwYXJhbVs4XSArIGJpYXNbaSAqIDMgKyAyXSk7XG4gICAgICAgICAgICB2YXIgaCA9IG9nICogYztcblxuICAgICAgICAgICAgQS5sc3RtLmdhdGVzLmluLmRbaV0gPSBpZztcbiAgICAgICAgICAgIEEubHN0bS5nYXRlcy5mb3JnZXQuZFtpXSA9IGZnO1xuICAgICAgICAgICAgQS5sc3RtLmdhdGVzLm91dC5kW2ldID0gb2c7XG5cbiAgICAgICAgICAgIEEubHN0bS5jZWxscy53LmRbaV0gPSBjO1xuICAgICAgICAgICAgQS53LmRbaV0gPSBoO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIExvbmdTaG9ydFRlcm1NZW1vcnlMYXllci5wcm90b3R5cGUuYmFja3dhcmQgPSBmdW5jdGlvbihBLCBWKSB7XG4gICAgICAgIHZhciBCSUFTID0gdGhpcy5wYXJhbWV0ZXJzLmJpYXNlcztcbiAgICAgICAgdmFyIGJpYXMgPSBCSUFTLncuZDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm91dC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIFBBUkFNID0gdGhpcy5wYXJhbWV0ZXJzLmZpbHRlcnNbaV07XG4gICAgICAgICAgICB2YXIgcGFyYW0gPSBQQVJBTS53LmQ7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBpZyA9IEEubHN0bS5nYXRlcy5pbi5kW2ldO1xuICAgICAgICAgICAgdmFyIGZnID0gQS5sc3RtLmdhdGVzLmZvcmdldC5kW2ldO1xuICAgICAgICAgICAgdmFyIG9nID0gQS5sc3RtLmdhdGVzLm91dC5kW2ldO1xuICAgICAgICAgICAgdmFyIGMgPSBBLmxzdG0uY2VsbHMudy5kW2ldO1xuXG4gICAgICAgICAgICB2YXIgeCA9IFYudy5kW2ldO1xuICAgICAgICAgICAgdmFyIGhfID0gQS5wcmV2LncuZFtpXTtcbiAgICAgICAgICAgIHZhciBjXyA9IEEucHJldi5sc3RtLmNlbGxzLncuZFtpXTtcblxuICAgICAgICAgICAgdmFyIGRoID0gQS5kdy5kW2ldO1xuICAgICAgICAgICAgdmFyIGRjID0gQS5sc3RtLmNlbGxzLmR3LmRbaV07XG5cbiAgICAgICAgICAgIHZhciBkb2cgPSBkc2lnbShvZykgKiBjICogZGg7XG4gICAgICAgICAgICAgICAgZGMgPSBkYyArIHBhcmFtWzhdICogZG9nICsgb2cgKiBkaDtcbiAgICAgICAgICAgIHZhciBkZmcgPSBkc2lnbShmZykgKiBjXyAqIGRjO1xuICAgICAgICAgICAgdmFyIGRpZyA9IGRzaWdtKGlnKSAqIHggKiBkYztcbiAgICAgICAgICAgIHZhciBkeCA9IGlnICogZGMgKyBwYXJhbVs2XSAqIGRvZyArIHBhcmFtWzNdICogZGZnICsgcGFyYW1bMF0gKiBkaWc7XG5cbiAgICAgICAgICAgIHZhciBkY18gPSBmZyAqIGRjICsgcGFyYW1bNV0gKiBkZmcgKyBwYXJhbVsyXSAqIGRpZztcbiAgICAgICAgICAgIHZhciBkaF8gPSBwYXJhbVs3XSAqIGRvZyArIHBhcmFtWzRdICogZGZnICsgcGFyYW1bMV0gKiBkaWc7XG5cbiAgICAgICAgICAgIEEucHJldi5sc3RtLmNlbGxzLmR3LmRbaV0gPSBkY187XG4gICAgICAgICAgICBBLnByZXYuZHcuZFtpXSArPSBkaF87IC8vIGFkZCB0byBhbHJlYWR5IGJhY2twcm9wcGVkIHZhbHVlXG4gICAgICAgICAgICBWLmR3LmRbaV0gPSBkeDtcblxuICAgICAgICAgICAgUEFSQU0uZHcuZFswXSArPSB4ICogZGlnO1xuICAgICAgICAgICAgUEFSQU0uZHcuZFsxXSArPSBoXyAqIGRpZztcbiAgICAgICAgICAgIFBBUkFNLmR3LmRbMl0gKz0gY18gKiBkaWc7XG4gICAgICAgICAgICBQQVJBTS5kdy5kWzNdICs9IHggKiBkZmc7XG4gICAgICAgICAgICBQQVJBTS5kdy5kWzRdICs9IGhfICogZGZnO1xuICAgICAgICAgICAgUEFSQU0uZHcuZFs1XSArPSBjXyAqIGRmZztcbiAgICAgICAgICAgIFBBUkFNLmR3LmRbNl0gKz0geCAqIGRvZztcbiAgICAgICAgICAgIFBBUkFNLmR3LmRbN10gKz0gaF8gKiBkb2c7XG4gICAgICAgICAgICBQQVJBTS5kdy5kWzhdICs9IGMgKiBkb2c7XG5cbiAgICAgICAgICAgIEJJQVMuZHcuZFtpICogMyArIDBdICs9IDEuMCAqIGRpZztcbiAgICAgICAgICAgIEJJQVMuZHcuZFtpICogMyArIDFdICs9IDEuMCAqIGRmZztcbiAgICAgICAgICAgIEJJQVMuZHcuZFtpICogMyArIDJdICs9IDEuMCAqIGRvZztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBMb25nU2hvcnRUZXJtTWVtb3J5TGF5ZXIucHJvdG90eXBlLlByZXBhcmVTdGF0ZUJsb2IgPSBmdW5jdGlvbihBKSB7XG4gICAgICAgIGlmICh0eXBlb2YgQS5zdGF0ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIEEubHN0bSA9IHtcbiAgICAgICAgICAgICAgICBjZWxsczogbmV3IGxpYi5CbG9iKHRoaXMub3V0LngsIHRoaXMub3V0LnksIHRoaXMub3V0LmRlcHRoLCAwLjApLFxuICAgICAgICAgICAgICAgIGdhdGVzOiB7IGluIDogbmV3IGxpYi5NYXQodGhpcy5vdXQueCwgdGhpcy5vdXQueSwgdGhpcy5vdXQuZGVwdGgsIDAuMCksXG4gICAgICAgICAgICAgICAgICAgIG91dDogbmV3IGxpYi5NYXQodGhpcy5vdXQueCwgdGhpcy5vdXQueSwgdGhpcy5vdXQuZGVwdGgsIDAuMCksXG4gICAgICAgICAgICAgICAgICAgIGZvcmdldDogbmV3IGxpYi5NYXQodGhpcy5vdXQueCwgdGhpcy5vdXQueSwgdGhpcy5vdXQuZGVwdGgsIDAuMClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgQS5sc3RtLmNlbGxzLncuYWxsKDApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGxpYi5Mb25nU2hvcnRUZXJtTWVtb3J5TGF5ZXIgPSBMb25nU2hvcnRUZXJtTWVtb3J5TGF5ZXI7XG59KShubmpzKTtcbiIsIihmdW5jdGlvbiAobGliKSB7IFwidXNlIHN0cmljdFwiO1xuXHRmdW5jdGlvbiBTaWdtb2lkTGF5ZXIob3B0KSB7XG5cdFx0dGhpcy5pbiA9IG9wdC5pbnB1dDtcblx0XHR0aGlzLm91dCA9IG9wdC5pbnB1dDtcblx0fTtcblxuXHRTaWdtb2lkTGF5ZXIucHJvdG90eXBlLmZvcndhcmQgPSBmdW5jdGlvbiAoViwgQSkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pbi5sZW5ndGg7IGkrKykge1xuXHRcdFx0QS53LmRbaV0gPSAxLjAvKDEuMCtNYXRoLmV4cCgtVi53LmRbaV0pKTtcblx0XHR9XG5cdH1cblxuXHRTaWdtb2lkTGF5ZXIucHJvdG90eXBlLmJhY2t3YXJkID0gZnVuY3Rpb24gKEEsIFYpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaW4ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFYuZHcuZFtpXSA9IEEudy5kW2ldICogKC1BLncuZFtpXSArIDEuMCkgKiBBLmR3LmRbaV07XG5cdFx0fVxuXHR9O1xuXG5cdGZ1bmN0aW9uIFJlbHVMYXllcihvcHQpIHtcblx0XHR0aGlzLmluID0gb3B0LmlucHV0O1xuXHRcdHRoaXMub3V0ID0gb3B0LmlucHV0O1xuXHR9O1xuXG5cdFJlbHVMYXllci5wcm90b3R5cGUuZm9yd2FyZCA9IGZ1bmN0aW9uIChWLCBBKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmluLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRBLncuZFtpXSA9IFYudy5kW2ldIDwgMCA/IDAgOiBWLncuZFtpXTtcblx0XHR9XG5cdH1cblxuXHRSZWx1TGF5ZXIucHJvdG90eXBlLmJhY2t3YXJkID0gZnVuY3Rpb24gKEEsIFYpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaW4ubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmKEEudy5kW2ldIDw9IDApIFYuZHcuZFtpXSA9IDA7IC8vIHRocmVzaG9sZFxuXHQgICAgICAgIGVsc2UgVi5kdy5kW2ldID0gQS5kdy5kW2ldO1xuXHRcdH1cblx0fTtcblxuXHRmdW5jdGlvbiBUYW5oTGF5ZXIob3B0KSB7XG5cdFx0dGhpcy5pbiA9IG9wdC5pbnB1dDtcblx0XHR0aGlzLm91dCA9IG9wdC5pbnB1dDtcblx0fTtcblxuXHRUYW5oTGF5ZXIucHJvdG90eXBlLmZvcndhcmQgPSBmdW5jdGlvbiAoViwgQSkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pbi5sZW5ndGg7IGkrKykge1xuXHRcdFx0QS53LmRbaV0gPSBsaWIuTWF0aFUudGFuaChWLncuZFtpXSk7XG5cdFx0fVxuXHR9XG5cblx0VGFuaExheWVyLnByb3RvdHlwZS5iYWNrd2FyZCA9IGZ1bmN0aW9uIChBLCBWKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmluLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRWLmR3LmRbaV0gPSAoMS4wIC0gQS53LmRbaV0gKiBBLncuZFtpXSkgKiBBLmR3LmRbaV07XG5cdCBcdH1cblx0fTtcblxuXHRsaWIuU2lnbW9pZExheWVyID0gU2lnbW9pZExheWVyO1xuXHRsaWIuUmVsdUxheWVyID0gUmVsdUxheWVyO1xuXHRsaWIuVGFuaExheWVyID0gVGFuaExheWVyO1xufSkobm5qcyk7IiwiKGZ1bmN0aW9uIChsaWIpIHsgXCJ1c2Ugc3RyaWN0XCI7XG5cblx0ZnVuY3Rpb24gUmVncmVzc2lvbkxheWVyKG9wdCkge1xuXHRcdHRoaXMuaW4gPSBvcHQuaW5wdXQ7XG5cdFx0dGhpcy5vdXQgPSBvcHQuaW5wdXQ7XG5cdH07XG5cblx0UmVncmVzc2lvbkxheWVyLnByb3RvdHlwZS5mb3J3YXJkID0gZnVuY3Rpb24gKFYsIEEpIHtcblx0XHRBLncud3JpdGUoVi53KTtcblx0fTtcblxuXHRSZWdyZXNzaW9uTGF5ZXIucHJvdG90eXBlLmJhY2t3YXJkID0gZnVuY3Rpb24gKEEsIFYsIGRlc2lyZWQpIHtcblx0XHR2YXIgbG9zcyA9IDAuMDtcblx0XHRpZihkZXNpcmVkIGluc3RhbmNlb2YgQXJyYXkgfHwgZGVzaXJlZCBpbnN0YW5jZW9mIEZsb2F0NjRBcnJheSkge1xuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IHRoaXMub3V0Lmxlbmd0aDsgKytpKSB7XG5cdFx0XHRcdFYuZHcuZFtpXSA9IEEudy5kW2ldIC0gZGVzaXJlZFtpXTtcblx0XHRcdFx0bG9zcyArPSAwLjUqVi5kdy5kW2ldKlYuZHcuZFtpXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gbG9zcztcblx0fTtcblxuXHRsaWIuUmVncmVzc2lvbkxheWVyID0gUmVncmVzc2lvbkxheWVyO1xuXG59KShubmpzKTsiLCIoZnVuY3Rpb24gKGxpYikgeyBcInVzZSBzdHJpY3RcIjtcblxuXHRmdW5jdGlvbiBTb2Z0bWF4TGF5ZXIob3B0KSB7XG5cdFx0dGhpcy5pbiA9IG9wdC5pbnB1dDtcblx0XHR0aGlzLm91dCA9IGxpYi5TaXplMygxLCAxLCB0aGlzLmluLnggKiB0aGlzLmluLnkgKiB0aGlzLmluLmRlcHRoKTtcblx0XHR0aGlzLmNsYXNzZXMgPSB0aGlzLm91dC5kZXB0aDtcblx0fTtcblxuXHRTb2Z0bWF4TGF5ZXIucHJvdG90eXBlLmZvcndhcmQgPSBmdW5jdGlvbiAoViwgQSkge1xuXHRcdC8vIGNvbXB1dGUgbWF4IGFjdGl2YXRpb25cblx0XHR2YXIgYW1heCA9IFYudy5kWzBdO1xuXHRcdGZvciAodmFyIGkgPSAxOyBpIDwgdGhpcy5jbGFzc2VzOyBpKyspIHtcblx0XHRcdGlmKFYudy5kW2ldID4gYW1heCkgYW1heCA9IFYudy5kW2ldO1xuXHRcdH1cblxuXHRcdC8vIGNvbXB1dGUgZXhwb25lbnRpYWxzIChjYXJlZnVsbHkgdG8gbm90IGJsb3cgdXApXG5cdFx0dmFyIGVzID0gbGliLk1hdC5DcmVhdGVBcnJheSh0aGlzLm91dC5kZXB0aCwgMC4wKSwgZXN1bSA9IDAuMDtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2xhc3NlczsgaSsrKSB7XG5cdFx0XHR2YXIgZSA9IE1hdGguZXhwKFYudy5kW2ldIC0gYW1heCk7XG5cdFx0XHRlc3VtICs9IGU7XG5cdFx0XHRlc1tpXSA9IGU7XG5cdFx0fVxuXG5cdFx0Ly8gbm9ybWFsaXplIGFuZCBvdXRwdXQgdG8gc3VtIHRvIG9uZVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jbGFzc2VzOyBpKyspIHtcblx0XHRcdGVzW2ldIC89IGVzdW07XG5cdFx0XHRBLncuZFtpXSA9IGVzW2ldO1xuXHRcdH1cblxuXHRcdHJldHVybiBBLncubWF4aSgpO1xuXHR9O1xuXG5cdFNvZnRtYXhMYXllci5wcm90b3R5cGUuYmFja3dhcmQgPSBmdW5jdGlvbiAoQSwgViwgZGVzaXJlZCkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jbGFzc2VzOyBpKyspIHtcblx0XHRcdHZhciBpbmRpY2F0b3IgPSBpID09PSBkZXNpcmVkID8gMS4wIDogMC4wO1xuXHRcdFx0Vi5kdy5kW2ldID0gQS53LmRbaV0gLSBpbmRpY2F0b3I7XG5cdFx0fVxuXG5cdFx0Ly8gbG9zcyBpcyB0aGUgY2xhc3MgbmVnYXRpdmUgbG9nIGxpa2VsaWhvb2Rcblx0XHRyZXR1cm4gLU1hdGgubG9nKEEudy5kW2Rlc2lyZWRdKTtcblx0fTtcblxuXHQvKiBhcHByb3guIDMwMHggZmFzdGVyIHRoYW4gc29mdG1heCwgZGVjcmVhc2UgaW4gYWNjdXJhY3kgYW5kIHBlcmZvcm1hbmNlICovXG5cdC8qKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gdHJlZSBbb2JqZWN0XSBvciBjbGFzc2VzIFtpbnRdXG5cdCAqL1xuXHRmdW5jdGlvbiBIaWVyYXJjaGljYWxTb2Z0bWF4KG9wdCkge1xuXHRcdHRoaXMuaW4gPSBvcHQuaW5wdXQ7XG5cblx0XHRpZiAob3B0LnRyZWUpIHtcblx0XHRcdHRoaXMudHJlZSA9IG9wdC50cmVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnRyZWUgPSB0aGlzLkJ1aWxkVHJlZShvcHQuY2xhc3Nlcyk7XG5cdFx0fVxuXG5cdFx0dGhpcy5QcmVwYXJlVHJlZSgpO1xuXG5cdFx0YXNzZXJ0KG9wdC5jbGFzc2VzID09PSB1bmRlZmluZWQgfHwgKG9wdC5jbGFzc2VzID09PSB0aGlzLmNsYXNzZXMpLCAnSGllcmFyY2hpY2FsU29mdG1heDogdHJlZSBub3Qgc3VwcG9ydGVkJyk7XG5cblx0XHR0aGlzLm5vZGVzID0gdGhpcy5jbGFzc2VzIC0gMTtcblx0XHR0aGlzLnBhcmFtZXRlcnMgPSB7XG5cdFx0XHRmaWx0ZXJzOiBbXSxcblx0XHRcdGJpYXNlczogbmV3IGxpYi5CbG9iKDEsIDEsIHRoaXMubm9kZXMsIDAuMClcblx0XHR9O1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm5vZGVzOyBpKyspIHtcblx0XHRcdHRoaXMucGFyYW1ldGVycy5maWx0ZXJzW2ldID0gbmV3IGxpYi5CbG9iKDEsIDEsIHRoaXMuaW4ubGVuZ3RoKTtcblx0XHR9XG5cdH07XG5cblx0SGllcmFyY2hpY2FsU29mdG1heC5QT0lOVEVSID0gMDtcblx0SGllcmFyY2hpY2FsU29mdG1heC5TRUxFQ1RPUiA9IDE7XG5cblx0SGllcmFyY2hpY2FsU29mdG1heC5wcm90b3R5cGUuQnVpbGRUcmVlID0gZnVuY3Rpb24gKGNsYXNzZXMpIHtcblx0XHQvLyBjcmVhdGUgdHJlZSBvZiBzaXplIGxvZyhjbGFzc2VzKVxuXHRcdHZhciBkZXB0aCA9IE1hdGguZmxvb3IoTWF0aC5sb2cyKGNsYXNzZXMpKTtcblx0XHR2YXIgdHJlZSA9IHRoaXMuQ3JlYXRlTm9kZShkZXB0aCwgbnVsbCk7XG5cblx0XHQvLyBhZGQgcmVtYWluaW5nIG5vZGVzIHRvIHRyZWVcblx0XHR2YXIgcmVtYWluZGVyID0gY2xhc3NlcyAtIE1hdGgucG93KDIsIGRlcHRoKTtcblx0XHR0aGlzLnRyYXZlcnNlKHRyZWUsIGZ1bmN0aW9uIChub2RlKSB7XG5cdFx0XHRpZiAobm9kZS50eXBlID09PSBIaWVyYXJjaGljYWxTb2Z0bWF4LlNFTEVDVE9SICYmIHJlbWFpbmRlciA+IDApIHtcblx0XHRcdFx0bm9kZS50eXBlID0gSGllcmFyY2hpY2FsU29mdG1heC5QT0lOVEVSO1xuXHRcdFx0XHRub2RlLmEgPSB0aGlzLkNyZWF0ZU5vZGUoMCwgbm9kZSk7XG5cdFx0XHRcdG5vZGUuYiA9IHRoaXMuQ3JlYXRlTm9kZSgwLCBub2RlKTtcblxuXHRcdFx0XHRyZW1haW5kZXItLTtcblxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHRyZWU7XG5cdH07IFxuXG5cdEhpZXJhcmNoaWNhbFNvZnRtYXgucHJvdG90eXBlLlByZXBhcmVUcmVlID0gZnVuY3Rpb24gKCkge1xuXHRcdHZhciBzZWwgPSAwLCBwdHIgPSAwLCB0YWJsZSA9IHt9O1xuXHRcdHRoaXMudHJhdmVyc2UodGhpcy50cmVlLCBmdW5jdGlvbiAobm9kZSkge1xuXHRcdFx0aWYgKG5vZGUudHlwZSA9PT0gSGllcmFyY2hpY2FsU29mdG1heC5TRUxFQ1RPUikge1xuXHRcdFx0XHR0YWJsZVtzZWxdID0gbm9kZTtcblx0XHRcdFx0bm9kZS5pbmRleCA9IHNlbDtcblx0XHRcdCsrc2VsO31cblxuXHRcdFx0ZWxzZSBpZiAobm9kZS50eXBlID09PSBIaWVyYXJjaGljYWxTb2Z0bWF4LlBPSU5URVIpIHtcblx0XHRcdFx0bm9kZS5pbmRleCA9IHB0cjtcblx0XHRcdHB0cisrO31cblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSk7XG5cblx0XHR0aGlzLmNsYXNzZXMgPSBzZWw7XG5cdFx0dGhpcy5ub2RlcyA9IHB0cjtcblx0XHR0aGlzLnRhYmxlID0gdGFibGU7XG5cdH07XG5cblx0SGllcmFyY2hpY2FsU29mdG1heC5wcm90b3R5cGUuQ3JlYXRlTm9kZSA9IGZ1bmN0aW9uIChkZXB0aCwgcGFyZW50KSB7XG5cdFx0dmFyIG5vZGUgPSB7IHBhcmVudDogcGFyZW50IH07XG5cblx0XHRpZiAoZGVwdGggPD0gMCkge1xuXHRcdFx0bm9kZS50eXBlID0gSGllcmFyY2hpY2FsU29mdG1heC5TRUxFQ1RPUjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bm9kZS50eXBlID0gSGllcmFyY2hpY2FsU29mdG1heC5QT0lOVEVSO1xuXHRcdFx0bm9kZS5hID0gdGhpcy5DcmVhdGVOb2RlKGRlcHRoLTEsIG5vZGUpO1xuXHRcdFx0bm9kZS5iID0gdGhpcy5DcmVhdGVOb2RlKGRlcHRoLTEsIG5vZGUpO1xuXHRcdH1cblxuXHRcdHJldHVybiBub2RlO1xuXHR9O1xuXG5cdEhpZXJhcmNoaWNhbFNvZnRtYXgucHJvdG90eXBlLnRyYXZlcnNlID0gZnVuY3Rpb24gKG5vZGUsIGNiKSB7XG5cdFx0aWYgKGNiLmNhbGwodGhpcywgbm9kZSkgJiYgbm9kZS50eXBlID09PSBIaWVyYXJjaGljYWxTb2Z0bWF4LlBPSU5URVIpIHtcblx0XHRcdHRoaXMudHJhdmVyc2Uobm9kZS5hLCBjYik7XG5cdFx0XHR0aGlzLnRyYXZlcnNlKG5vZGUuYiwgY2IpO1xuXHRcdH1cblx0fTtcblxuXHRIaWVyYXJjaGljYWxTb2Z0bWF4LnByb3RvdHlwZS5hc2NlbmQgPSBmdW5jdGlvbiAobm9kZSwgY2IpIHtcblx0XHRpZiAobm9kZS5wYXJlbnQgPT09IG51bGwpIHJldHVybiA7XG5cdFx0Y2IuY2FsbCh0aGlzLCBub2RlLnBhcmVudCwgbm9kZSA9PT0gbm9kZS5wYXJlbnQuYSA/IC0xLjAgOiAxLjApO1xuXHRcdHRoaXMuYXNjZW5kKG5vZGUucGFyZW50LCBjYik7XG5cdH07XG5cblx0SGllcmFyY2hpY2FsU29mdG1heC5wcm90b3R5cGUuZGVzY2VuZCA9IGZ1bmN0aW9uIChub2RlLCBjYikge1xuXHRcdHZhciBkID0gY2IuY2FsbCh0aGlzLCBub2RlKTtcblxuXHRcdGlmIChub2RlLnR5cGUgPT09IEhpZXJhcmNoaWNhbFNvZnRtYXguU0VMRUNUT1IgfHwgZCBpbnN0YW5jZW9mIE9iamVjdCB8fCBkID09PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gZDtcblx0XHR9XG5cblx0XHRpZiAoZCA+IDAuMCkgeyAvLyBuZWdhdGl2ZSBtZWFucyBsZWZ0LCBwb3NpdGl2ZSBtZWFucyByaWdodFxuXHRcdFx0cmV0dXJuIHRoaXMuZGVzY2VuZChub2RlLmIsIGNiKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMuZGVzY2VuZChub2RlLmEsIGNiKTtcblx0XHR9XG5cdH07XG5cblx0SGllcmFyY2hpY2FsU29mdG1heC5wcm90b3R5cGUuYWN0aXZhdGUgPSBmdW5jdGlvbiAoViwgaSkge1xuXHRcdHZhciBzdW0gPSAwLjA7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLmluLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRzdW0gKz0gVi53LmRbal0gKiB0aGlzLnBhcmFtZXRlcnMuZmlsdGVyc1tpXS53LmRbal07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGxpYi5NYXRoVS50YW5oKHRoaXMucGFyYW1ldGVycy5iaWFzZXMudy5kW2ldICsgc3VtKTtcblx0fTtcblxuXHRIaWVyYXJjaGljYWxTb2Z0bWF4LnByb3RvdHlwZS5ncmFkaWVudCA9IGZ1bmN0aW9uIChWLCBpLCBkaXJlY3Rpb24pIHtcblx0XHR2YXIgYWN0ID0gdGhpcy5hY3RpdmF0ZShWLCBpKSxcblx0XHRcdFx0ZXJyID0gYWN0IC0gZGlyZWN0aW9uO1xuXG5cdFx0dmFyIGR3ID0gKDEuMCAtIGFjdCAqIGFjdCkgKiBlcnI7XG5cdFx0dGhpcy5wYXJhbWV0ZXJzLmZpbHRlcnNbaV0ubm9jaGFuZ2UgPSBmYWxzZTtcblxuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5pbi5sZW5ndGg7IGorKykge1xuXHRcdFx0dGhpcy5wYXJhbWV0ZXJzLmZpbHRlcnNbaV0uZHcuZFtqXSArPSBWLncuZFtqXSAqIGR3O1xuXHRcdFx0Vi5kdy5kW2pdICs9IHRoaXMucGFyYW1ldGVycy5maWx0ZXJzW2ldLncuZFtqXSAqIGR3O1xuXHRcdH1cblxuXHRcdHRoaXMucGFyYW1ldGVycy5iaWFzZXMuZHcuZFtpXSArPSBkdztcblxuXHRcdHJldHVybiAoZGlyZWN0aW9uIDwgMCA/IDEgLSAoYWN0ICogMC41ICsgMC41KSA6IChhY3QgKiAwLjUgKyAwLjUpKTsgLy8gcHJvYmFiaWxpdHkgdG8gZ28gdGhlIHJpZ2h0IHdheVxuXHR9O1xuXG5cdEhpZXJhcmNoaWNhbFNvZnRtYXgucHJvdG90eXBlLmZvcndhcmQgPSBmdW5jdGlvbiAoViwgQSkge1xuXHRcdHZhciBzZWxlY3RlZCA9IHRoaXMuZGVzY2VuZCh0aGlzLnRyZWUsIGZ1bmN0aW9uIChub2RlKSB7XG5cdFx0XHRpZiAobm9kZS50eXBlID09PSBIaWVyYXJjaGljYWxTb2Z0bWF4LlBPSU5URVIpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuYWN0aXZhdGUoViwgbm9kZS5pbmRleCk7XG5cdFx0XHR9XG5cblx0XHRcdGVsc2UgaWYgKG5vZGUudHlwZSA9PT0gSGllcmFyY2hpY2FsU29mdG1heC5TRUxFQ1RPUikge1xuXHRcdFx0XHRyZXR1cm4gbm9kZTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gKEEuaW5kZXggPSBzZWxlY3RlZC5pbmRleCk7XG5cdH07XG5cblx0SGllcmFyY2hpY2FsU29mdG1heC5wcm90b3R5cGUuYmFja3dhcmQgPSBmdW5jdGlvbiAoQSwgViwgZGVzaXJlZCkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYXJhbWV0ZXJzLmZpbHRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMucGFyYW1ldGVycy5maWx0ZXJzW2ldLm5vY2hhbmdlID0gdHJ1ZTtcblx0XHR9XG5cblx0XHR2YXIgcHJvYiA9IDEuMDtcblx0XHR0aGlzLmFzY2VuZCh0aGlzLnRhYmxlW2Rlc2lyZWRdLCBmdW5jdGlvbiAobm9kZSwgZGlyZWN0aW9uKSB7XG5cdFx0XHRwcm9iID0gcHJvYiAqIHRoaXMuZ3JhZGllbnQoViwgbm9kZS5pbmRleCwgZGlyZWN0aW9uKTtcblx0XHR9KTtcblxuXHRcdHJldHVybiAxLjAgLSBwcm9iOyAvLyBwcm9iYWJpbGl0eSB0byBOT1QgZ28gdGhlIHJpZ2h0IHdheVxuXHR9O1xuXG5cdGxpYi5Tb2Z0bWF4TGF5ZXIgPSBTb2Z0bWF4TGF5ZXI7XG5cdGxpYi5IaWVyYXJjaGljYWxTb2Z0bWF4ID0gSGllcmFyY2hpY2FsU29mdG1heDtcbn0pKG5uanMpOyIsIihmdW5jdGlvbihsaWIpIHsgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJ1bmRlZmluZWRcIiB8fCB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBcdGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgeyAvLyB3ZWIgd29ya2VyIHN1cHBvcnQ7IGp1c3QgdXNlIG5uanMgaW4gd2ViIHdvcmtlclxuICAgIFx0XHR3aW5kb3cubm4gPSBsaWI7XG4gICAgXHR9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBsaWI7XG4gICAgfVxuICAgIFxufSkobm5qcyk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
