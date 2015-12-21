(function() {
  var guessLang;

  this.locale = {
    "pt-BR": {
      measures: {
        label: "Medidas",
        waist: {
          label: "Cintura",
          description: "Você provavelmente sabe onde fica, mas aqui vai a dica: a cintura é aquela região próxima ao umbigo."
        },
        shoulders: {
          label: "Ombros",
          description: "De ombro a ombro (de um lado dele ao outro)"
        },
        bust: {
          label: "Busto",
          description: "Para medir o busto, posicione a régua no centro do tronco, na altura do peito."
        },
        hips: {
          label: "Quadril",
          description: "Posicione a régua na região mais larga dos quadris para tirar a medida."
        },
        arm: {
          label: "Braço",
          description: "Meça do fim dos ombros até o ossinho dos pulsos."
        },
        right_wrist: {
          label: "Punho direito",
          description: "Meça de um lado a outro do punho."
        },
        reference: {
          label: "Referência",
          description: "A medida de referência é um objeto de tamanho conhecido. Por exemplo a largura da sua mão."
        },
        trunk: {
          label: "Tronco",
          description: "Considerando do ombro até o quadril."
        }
      }
    }
  };

  guessLang = navigator.language || window.navigator.userLanguage;

  this.t = this.locale[guessLang] || this.locale["pt-BR"];

}).call(this);

(function() {
  this.Search = (function() {
    function Search() {
      this.processParams();
      this.type || (this.type = "tshirt");
      this.gender || (this.gender = "M");
      this.trend || (this.trend = "kanui");
    }

    Search.prototype.processParams = function() {
      var name, query, queryPairs, value, _i, _len, _ref, _results;
      query = window.location.search.substring(1);
      queryPairs = query.split('&');
      _results = [];
      for (_i = 0, _len = queryPairs.length; _i < _len; _i++) {
        query = queryPairs[_i];
        _ref = query.split('='), name = _ref[0], value = _ref[1];
        _results.push(this[name] = value);
      }
      return _results;
    };

    Search.prototype.models = function() {
      return wear[this.trend][this.gender][this.type];
    };

    Search.prototype.measuresNeeded = function() {
      var match, measureName, need, value, _ref;
      need = {
        front: [],
        side: []
      };
      _ref = this.models().models[0].measures;
      for (measureName in _ref) {
        value = _ref[measureName];
        match = /(front|side)[A-Z]/.exec(measureName);
        if (match) {
          measureName = measureName.replace(match[1], "").toLowerCase();
          need[match[1]].push(measureName);
        } else {
          need.front.push(measureName);
          need.side.push(measureName);
        }
      }
      return need;
    };

    Search.prototype.fitsWith = function(front, side) {
      return this.models().match(front, side);
    };

    return Search;

  })();

}).call(this);

(function() {
  this.CountdownTimer = (function() {
    function CountdownTimer(seconds, onFinish, eachStep) {
      this.seconds = seconds;
      this.onFinish = onFinish;
      this.eachStep = eachStep;
      this.sound = UI.audio('countdown', 'mp3');
      this.flash = UI.audio('flash', 'ogg');
      this.success = UI.audio('success', 'mp3');
    }

    CountdownTimer.prototype.perform = function(sound, percent) {
      var countdown;
      if (sound == null) {
        sound = "flash";
      }
      if (percent == null) {
        percent = false;
      }
      countdown = function(i) {
        var aux, _ref, _ref1;
        aux = i;
        if (percent) {
          aux = this.seconds - i - 1;
          UI.progress(parseInt(100 * aux / this.seconds));
        } else {
          UI.countdown(aux);
        }
        if (i < 0) {
          if (typeof this.onFinish === "function") {
            this.onFinish();
          }
          if (sound) {
            if (sound === "flash") {
              return (_ref = this.flash) != null ? _ref.play() : void 0;
            } else {
              return (_ref1 = this.success) != null ? _ref1.play() : void 0;
            }
          }
        } else {
          if (this.canceled == null) {
            setTimeout(countdown.bind(this), 1000, i - 1);
          }
          if (typeof this.eachStep === "function") {
            this.eachStep(i);
          }
          if (i < 4) {
            return this.sound.play();
          }
        }
      };
      return countdown.bind(this)(this.seconds);
    };

    CountdownTimer.prototype.cancel = function() {
      return this.canceled = true;
    };

    return CountdownTimer;

  })();

}).call(this);

(function() {
  this.Slic = (function() {
    function Slic(imageData, options) {
      this.imageData = ImageProcessing.dupImageDataColor(imageData);
      options = options || {};
      this.regionSize = options.regionSize || 16;
      this.minRegionSize = options.minRegionSize || Math.round(this.regionSize * 0.8);
      this.maxIterations = options.maxIterations || this.regionSize / 2;
      this._compute();
    }

    Slic.prototype.finer = function() {
      var newSize;
      newSize = Math.max(5, Math.round(this.regionSize / Math.sqrt(2.0)));
      if (newSize !== this.regionSize) {
        this.regionSize = newSize;
        this.minRegionSize = Math.round(newSize * 0.8);
        return this._compute();
      }
    };

    Slic.prototype.coarser = function() {
      var newSize;
      newSize = Math.min(640, Math.round(this.regionSize * Math.sqrt(2.0)));
      if (newSize !== this.regionSize) {
        this.regionSize = newSize;
        this.minRegionSize = Math.round(newSize * 0.8);
        return this._compute();
      }
    };

    Slic.prototype._compute = function() {
      return this.result = this.computeSLICSegmentation(this.imageData, this.regionSize, this.minRegionSize, this.maxIterations);
    };

    Slic.prototype.rgb2xyz = function(rgba, w, h) {
      var b, g, gamma, i, r, xyz, _i, _ref;
      xyz = new Float32Array(3 * w * h);
      gamma = 2.2;
      for (i = _i = 0, _ref = w * h; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        r = rgba[4 * i + 0] * 0.00392156862;
        g = rgba[4 * i + 1] * 0.00392156862;
        b = rgba[4 * i + 2] * 0.00392156862;
        r = Math.pow(r, gamma);
        g = Math.pow(g, gamma);
        b = Math.pow(b, gamma);
        xyz[i] = r * 0.4887180 + g * 0.310680 + b * 0.2006020;
        xyz[i + w * h] = r * 0.1762040 + g * 0.812985 + b * 0.0108109;
        xyz[i + 2 * w * h] = g * 0.0102048 + b * 0.989795;
      }
      return xyz;
    };

    Slic.prototype.xyz2lab = function(xyz, w, h) {
      var Xw, Yw, Zw, f, fx, fy, fz, i, ix, iy, iz, labData, xw, yw, _i, _ref;
      f = function(x) {
        if (x > 0.00856) {
          return Math.pow(x, 0.33333333);
        } else {
          return 7.78706891568 * x + 0.1379310336;
        }
      };
      xw = 1.0 / 3.0;
      yw = 1.0 / 3.0;
      Yw = 1.0;
      Xw = xw / yw;
      Zw = (1 - xw - yw) / (yw * Yw);
      ix = 1.0 / Xw;
      iy = 1.0 / Yw;
      iz = 1.0 / Zw;
      labData = new Float32Array(3 * w * h);
      for (i = _i = 0, _ref = w * h; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        fx = f(xyz[i] * ix);
        fy = f(xyz[w * h + i] * iy);
        fz = f(xyz[2 * w * h + i] * iz);
        labData[i] = 116.0 * fy - 16.0;
        labData[i + w * h] = 500.0 * (fx - fy);
        labData[i + 2 * w * h] = 200.0 * (fy - fz);
      }
      return labData;
    };

    Slic.prototype.computeEdge = function(image, edgeMap, w, h) {
      var a, b, c, d, k, x, y, _i, _results;
      _results = [];
      for (k = _i = 0; _i < 3; k = ++_i) {
        _results.push((function() {
          var _j, _ref, _results1;
          _results1 = [];
          for (y = _j = 1, _ref = h - 1; 1 <= _ref ? _j < _ref : _j > _ref; y = 1 <= _ref ? ++_j : --_j) {
            _results1.push((function() {
              var _k, _ref1, _results2;
              _results2 = [];
              for (x = _k = 1, _ref1 = w - 1; 1 <= _ref1 ? _k < _ref1 : _k > _ref1; x = 1 <= _ref1 ? ++_k : --_k) {
                a = image[k * w * h + y * w + x - 1];
                b = image[k * w * h + y * w + x + 1];
                c = image[k * w * h + (y + 1) * w + x];
                d = image[k * w * h + (y - 1) * w + x];
                _results2.push(edgeMap[y * w + x] += Math.pow(a - b, 2) + Math.pow(c - d, 2));
              }
              return _results2;
            })());
          }
          return _results1;
        })());
      }
      return _results;
    };

    Slic.prototype.initializeKmeansCenters = function(image, edgeMap, centers, clusterParams, numRegionsX, numRegionsY, regionSize, imW, imH) {
      var centerx, centery, i, j, minEdgeValue, u, v, x, xp, y, yp, _i, _results;
      i = 0;
      j = 0;
      _results = [];
      for (v = _i = 0; 0 <= numRegionsY ? _i < numRegionsY : _i > numRegionsY; v = 0 <= numRegionsY ? ++_i : --_i) {
        _results.push((function() {
          var _j, _k, _l, _ref, _ref1, _ref2, _ref3, _results1;
          _results1 = [];
          for (u = _j = 0; 0 <= numRegionsX ? _j < numRegionsX : _j > numRegionsX; u = 0 <= numRegionsX ? ++_j : --_j) {
            centerx = 0;
            centery = 0;
            minEdgeValue = Infinity;
            x = parseInt(Math.round(regionSize * (u + 0.5)), 10);
            y = parseInt(Math.round(regionSize * (v + 0.5)), 10);
            x = Math.max(Math.min(x, imW - 1), 0);
            y = Math.max(Math.min(y, imH - 1), 0);
            for (yp = _k = _ref = Math.max(0, y - 1), _ref1 = Math.min(imH - 1, y + 1); _ref <= _ref1 ? _k < _ref1 : _k > _ref1; yp = _ref <= _ref1 ? ++_k : --_k) {
              for (xp = _l = _ref2 = Math.max(0, x - 1), _ref3 = Math.min(imW - 1, x + 1); _ref2 <= _ref3 ? _l < _ref3 : _l > _ref3; xp = _ref2 <= _ref3 ? ++_l : --_l) {
                this.dgeValue = edgeMap[yp * imW + xp];
                if (this.dgeValue < minEdgeValue) {
                  minEdgeValue = this.dgeValue;
                  centerx = xp;
                  centery = yp;
                }
              }
            }
            centers[i++] = parseFloat(centerx);
            centers[i++] = parseFloat(centery);
            centers[i++] = image[centery * imW + centerx];
            centers[i++] = image[imW * imH + centery * imW + centerx];
            centers[i++] = image[2 * imW * imH + centery * imW + centerx];
            clusterParams[j++] = 10 * 10;
            _results1.push(clusterParams[j++] = regionSize * regionSize);
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    Slic.prototype.computeCenters = function(image, segmentation, masses, centers, numRegions, imW, imH) {
      var iMass, region, x, y, _i, _j, _k, _results;
      for (y = _i = 0; 0 <= imH ? _i < imH : _i > imH; y = 0 <= imH ? ++_i : --_i) {
        for (x = _j = 0; 0 <= imW ? _j < imW : _j > imW; x = 0 <= imW ? ++_j : --_j) {
          region = segmentation[x + y * imW];
          masses[region]++;
          centers[region * 5 + 0] += x;
          centers[region * 5 + 1] += y;
          centers[region * 5 + 2] += image[y * imW + x];
          centers[region * 5 + 3] += image[imW * imH + y * imW + x];
          centers[region * 5 + 4] += image[2 * imW * imH + y * imW + x];
        }
      }
      _results = [];
      for (region = _k = 0; 0 <= numRegions ? _k < numRegions : _k > numRegions; region = 0 <= numRegions ? ++_k : --_k) {
        iMass = 1.0 / Math.max(masses[region], 1e-8);
        centers[region * 5] = centers[region * 5] * iMass;
        centers[region * 5 + 1] = centers[region * 5 + 1] * iMass;
        centers[region * 5 + 2] = centers[region * 5 + 2] * iMass;
        centers[region * 5 + 3] = centers[region * 5 + 3] * iMass;
        _results.push(centers[region * 5 + 4] = centers[region * 5 + 4] * iMass);
      }
      return _results;
    };

    Slic.prototype.eliminateSmallRegions = function(segmentation, minRegionSize, numPixels, imW, imH) {
      var cleaned, cleanedLabel, direction, dx, dy, i, label, neighbor, numExpanded, open, pixel, segment, segmentSize, x, xp, y, yp, _i, _j, _k, _l, _m, _results;
      cleaned = new Int32Array(numPixels);
      segment = new Int32Array(numPixels);
      dx = new Array(1, -1, 0, 0);
      dy = new Array(0, 0, 1, -1);
      for (pixel = _i = 0; 0 <= numPixels ? _i < numPixels : _i > numPixels; pixel = 0 <= numPixels ? ++_i : --_i) {
        if (cleaned[pixel]) {
          continue;
        }
        label = segmentation[pixel];
        numExpanded = 0;
        segmentSize = 0;
        segment[segmentSize++] = pixel;
        cleanedLabel = label + 1;
        cleaned[pixel] = label + 1;
        x = pixel % imW;
        y = Math.floor(pixel / imW);
        for (direction = _j = 0; _j < 4; direction = ++_j) {
          xp = x + dx[direction];
          yp = y + dy[direction];
          neighbor = xp + yp * imW;
          if (0 <= xp && xp < imW && 0 <= yp && yp < imH && cleaned[neighbor]) {
            cleanedLabel = cleaned[neighbor];
          }
        }
        while (numExpanded < segmentSize) {
          open = segment[numExpanded++];
          x = open % imW;
          y = Math.floor(open / imW);
          for (direction = _k = 0; _k < 4; direction = ++_k) {
            xp = x + dx[direction];
            yp = y + dy[direction];
            neighbor = xp + yp * imW;
            if (0 <= xp && xp < imW && 0 <= yp && yp < imH && cleaned[neighbor] === 0 && segmentation[neighbor] === label) {
              cleaned[neighbor] = label + 1;
              segment[segmentSize++] = neighbor;
            }
          }
        }
        if (segmentSize < minRegionSize) {
          while (segmentSize > 0) {
            cleaned[segment[--segmentSize]] = cleanedLabel;
          }
        }
      }
      for (pixel = _l = 0; 0 <= numPixels ? _l < numPixels : _l > numPixels; pixel = 0 <= numPixels ? ++_l : --_l) {
        --cleaned[pixel];
      }
      _results = [];
      for (i = _m = 0; 0 <= numPixels ? _m < numPixels : _m > numPixels; i = 0 <= numPixels ? ++_m : --_m) {
        _results.push(segmentation[i] = cleaned[i]);
      }
      return _results;
    };

    Slic.prototype.updateClusterParams = function(segmentation, mcMap, msMap, clusterParams) {
      var i, mc, ms, region, _i, _ref, _results;
      mc = new Float32Array(clusterParams.length / 2);
      ms = new Float32Array(clusterParams.length / 2);
      _results = [];
      for (i = _i = 0, _ref = segmentation.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        region = segmentation[i];
        if (mc[region] < mcMap[region]) {
          mc[region] = mcMap[region];
          clusterParams[region * 2 + 0] = mcMap[region];
        }
        if (ms[region] < msMap[region]) {
          ms[region] = msMap[region];
          _results.push(clusterParams[region * 2 + 1] = msMap[region]);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Slic.prototype.assignSuperpixelLabel = function(im, segmentation, mcMap, msMap, distanceMap, centers, clusterParams, numRegionsX, numRegionsY, regionSize, imW, imH) {
      var S, appearance, cx, cy, dB, dG, dR, distance, i, region, spatial, x, y, _i, _j, _k, _l, _m, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _results;
      for (i = _i = 0, _ref = distanceMap.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        distanceMap[i] = Infinity;
      }
      S = regionSize;
      for (region = _j = 0, _ref1 = numRegionsX * numRegionsY; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; region = 0 <= _ref1 ? ++_j : --_j) {
        cx = Math.round(centers[region * 5 + 0]);
        cy = Math.round(centers[region * 5 + 1]);
        for (y = _k = _ref2 = Math.max(0, cy - S), _ref3 = Math.min(imH, cy + S); _ref2 <= _ref3 ? _k < _ref3 : _k > _ref3; y = _ref2 <= _ref3 ? ++_k : --_k) {
          for (x = _l = _ref4 = Math.max(0, cx - S), _ref5 = Math.min(imW, cx + S); _ref4 <= _ref5 ? _l < _ref5 : _l > _ref5; x = _ref4 <= _ref5 ? ++_l : --_l) {
            spatial = (x - cx) * (x - cx) + (y - cy) * (y - cy);
            dR = im[y * imW + x] - centers[5 * region + 2];
            dG = im[imW * imH + y * imW + x] - centers[5 * region + 3];
            dB = im[2 * imW * imH + y * imW + x] - centers[5 * region + 4];
            appearance = dR * dR + dG * dG + dB * dB;
            distance = Math.sqrt(appearance / clusterParams[region * 2 + 0] + spatial / clusterParams[region * 2 + 1]);
            if (distance < distanceMap[y * imW + x]) {
              distanceMap[y * imW + x] = distance;
              segmentation[y * imW + x] = region;
            }
          }
        }
      }
      _results = [];
      for (y = _m = 0; 0 <= imH ? _m < imH : _m > imH; y = 0 <= imH ? ++_m : --_m) {
        _results.push((function() {
          var _n, _results1;
          _results1 = [];
          for (x = _n = 0; 0 <= imW ? _n < imW : _n > imW; x = 0 <= imW ? ++_n : --_n) {
            if (clusterParams[segmentation[y * imW + x] * 2] < mcMap[y * imW + x]) {
              clusterParams[segmentation[y * imW + x] * 2] = mcMap[y * imW + x];
            }
            if (clusterParams[segmentation[y * imW + x] * 2 + 1] < msMap[y * imW + x]) {
              _results1.push(clusterParams[segmentation[y * imW + x] * 2 + 1] = msMap[y * imW + x]);
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        })());
      }
      return _results;
    };

    Slic.prototype.computeResidualError = function(prevCenters, currentCenters) {
      var d, error, i, _i, _ref;
      error = 0.0;
      for (i = _i = 0, _ref = prevCenters.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        d = prevCenters[i] - currentCenters[i];
        error += Math.sqrt(d * d);
      }
      return error;
    };

    Slic.prototype.remapLabels = function(segmentation) {
      var i, index, label, map, _i, _ref;
      map = {};
      index = 0;
      for (i = _i = 0, _ref = segmentation.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        label = segmentation[i];
        if (map[label] === void 0) {
          map[label] = index++;
        }
        segmentation[i] = map[label];
      }
      return index;
    };

    Slic.prototype.encodeLabels = function(segmentation, data) {
      var i, value, _base, _i, _ref, _results;
      this.clusters = [];
      this.segmentation = segmentation;
      _results = [];
      for (i = _i = 0, _ref = segmentation.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        value = Math.floor(segmentation[i]);
        data[i] = value & 255;
        (_base = this.clusters)[value] || (_base[value] = []);
        _results.push(this.clusters[value].push(i));
      }
      return _results;
    };

    Slic.prototype.computeSLICSegmentation = function(imageData, regionSize, minRegionSize, maxIterations) {
      var clusterParams, currentCenters, distanceMap, edgeMap, error, i, imHeight, imWidth, iter, labData, masses, mcMap, msMap, newCenters, numPixels, numRegions, numRegionsX, numRegionsY, result, segmentation, xyzData, _i, _j, _k, _l, _ref, _ref1, _ref2;
      imWidth = imageData.cols;
      imHeight = imageData.rows;
      numRegionsX = Math.floor(imWidth / regionSize);
      numRegionsY = Math.floor(imHeight / regionSize);
      numRegions = Math.floor(numRegionsX * numRegionsY);
      numPixels = Math.floor(imWidth * imHeight);
      edgeMap = new Float32Array(numPixels);
      masses = new Array(numPixels);
      currentCenters = new Float32Array((2 + 3) * numRegions);
      newCenters = new Float32Array((2 + 3) * numRegions);
      clusterParams = new Float32Array(2 * numRegions);
      mcMap = new Float32Array(numPixels);
      msMap = new Float32Array(numPixels);
      distanceMap = new Float32Array(numPixels);
      xyzData = this.rgb2xyz(imageData.data, imWidth, imHeight);
      labData = this.xyz2lab(xyzData, imWidth, imHeight);
      this.computeEdge(labData, edgeMap, imWidth, imHeight);
      this.initializeKmeansCenters(labData, edgeMap, currentCenters, clusterParams, numRegionsX, numRegionsY, regionSize, imWidth, imHeight);
      segmentation = new Int32Array(numPixels);
      for (iter = _i = 0; 0 <= maxIterations ? _i < maxIterations : _i > maxIterations; iter = 0 <= maxIterations ? ++_i : --_i) {
        this.assignSuperpixelLabel(labData, segmentation, mcMap, msMap, distanceMap, currentCenters, clusterParams, numRegionsX, numRegionsY, regionSize, imWidth, imHeight);
        this.updateClusterParams(segmentation, mcMap, msMap, clusterParams);
        for (i = _j = 0, _ref = masses.length; 0 <= _ref ? _j < _ref : _j > _ref; i = 0 <= _ref ? ++_j : --_j) {
          masses[i] = 0;
        }
        for (i = _k = 0, _ref1 = newCenters.length; 0 <= _ref1 ? _k < _ref1 : _k > _ref1; i = 0 <= _ref1 ? ++_k : --_k) {
          newCenters[i] = 0;
        }
        this.computeCenters(labData, segmentation, masses, newCenters, numRegions, imWidth, imHeight);
        error = this.computeResidualError(currentCenters, newCenters);
        if (error < 1e-5) {
          break;
        }
        for (i = _l = 0, _ref2 = currentCenters.length; 0 <= _ref2 ? _l < _ref2 : _l > _ref2; i = 0 <= _ref2 ? ++_l : --_l) {
          currentCenters[i] = newCenters[i];
        }
      }
      this.eliminateSmallRegions(segmentation, minRegionSize, numPixels, imWidth, imHeight);
      result = ImageProcessing.matrix(imWidth, imHeight);
      result.numSegments = this.remapLabels(segmentation);
      this.encodeLabels(segmentation, result.data);
      return result;
    };

    return Slic;

  })();

}).call(this);

(function() {
  this.ImageProcessing = {
    matrix: function(w, h) {
      return new jsfeat.matrix_t(w, h, jsfeat.U8_t | jsfeat.C1_t);
    },
    matrixColor: function(w, h) {
      return new jsfeat.matrix_t(w, h, jsfeat.U8_t | jsfeat.C4_t);
    },
    imageDifferenceAbs: function(imageA, imageB) {
      var difference, i, pixel, _i, _len, _ref;
      difference = ImageProcessing.matrix(imageA.width, imageA.height);
      _ref = imageA.data;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        pixel = _ref[i];
        difference[i] = Math.abs(pixel - imageB.data[i]);
      }
      return difference;
    },
    imageDifferenceInPercent: function(imageA, imageB) {
      var i, pixel, sum, _i, _len, _ref;
      sum = 0;
      _ref = imageA.data;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        pixel = _ref[i];
        sum += Math.abs(pixel - imageB.data[i]);
      }
      return sum / imageA.data.length / 2.55;
    },
    grayBlurData: function(image, blurSize) {
      var gray;
      gray = this.grayScale(image);
      return gray;
    },
    grayScale: function(image) {
      var gray, h, w, _ref;
      _ref = [image.width, image.height], w = _ref[0], h = _ref[1];
      gray = this.matrix(w, h);
      jsfeat.imgproc.grayscale(image.data, w, h, gray);
      return gray;
    },
    blur: function(gray, blurSize) {
      if (blurSize > 0) {
        jsfeat.imgproc.gaussian_blur(gray, gray, blurSize);
      }
      return gray;
    },
    convertRGBtoHue: function(r, g, b) {
      var c, delta, max, min;
      min = Math.min(r, g, b);
      max = Math.max(r, g, b);
      delta = max - min;
      c = r === max ? g - b : g === max ? b - r : r - g;
      return Math.abs(c) * 20;
    },
    convertHSVtoRGB: function(h, s, v) {
      var b, f, g, i, p, q, r, t, _ref, _ref1;
      if (arguments.length === 1) {
        _ref = h, s = _ref.s, v = _ref.v, h = _ref.h;
      }
      i = Math.floor(h * 6);
      if (isNaN(i)) {
        return {
          r: 0,
          g: 0,
          b: 0
        };
      }
      f = h * 6 - i;
      p = v * (1 - s);
      q = v * (1 - f * s);
      t = v * (1 - (1 - f) * s);
      _ref1 = (function() {
        switch (i % 6) {
          case 0:
            return [v, t, p];
          case 1:
            return [q, v, p];
          case 2:
            return [p, v, t];
          case 3:
            return [p, q, v];
          case 4:
            return [t, p, v];
          case 5:
            return [v, p, q];
        }
      })(), r = _ref1[0], g = _ref1[1], b = _ref1[2];
      return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
      };
    },
    convertRGBtoHSV: function(r, g, b) {
      var d, h, max, min, s, v, _ref;
      if (arguments.length === 1) {
        _ref = r, b = _ref.b, g = _ref.g, r = _ref.r;
      }
      max = Math.max(r, g, b);
      min = Math.min(r, g, b);
      d = max - min;
      s = (max === 0 ? 0 : d / max);
      v = max / 255;
      switch (max) {
        case min:
          h = 0;
          break;
        case r:
          h = (g - b) + d * (g < b ? 6 : 0);
          h /= 6 * d;
          break;
        case g:
          h = (b - r) + d * 2;
          h /= 6 * d;
          break;
        case b:
          h = (r - g) + d * 4;
          h /= 6 * d;
      }
      return {
        h: h,
        s: s,
        v: v
      };
    },
    convertHSVtoHSL: function(h, s, v) {
      var _l, _ref, _s;
      if (arguments.length === 1) {
        _ref = h, s = _ref.s, v = _ref.v, h = _ref.h;
      }
      _s = s * v;
      _l = (2 - s) * v;
      _s /= _l <= 1 ? _l : 2 - _l;
      _l /= 2;
      return {
        h: h,
        s: _s,
        l: _l
      };
    },
    convertHSLtoHSV: function(h, s, l) {
      var _ref, _s, _v;
      if (arguments.length === 1) {
        _ref = h, s = _ref.s, l = _ref.l, h = _ref.h;
      }
      l *= 2;
      s *= l <= 1 ? l : 2 - l;
      _v = (l + s) / 2;
      _s = (2 * s) / (l + s);
      return {
        h: h,
        s: _s,
        v: _v
      };
    },
    proccessRGB: function(r, g, b) {
      var aux, aux2, hsl, hsv, hsv0, rgb;
      hsv = this.convertRGBtoHSV(r, g, b);
      hsv.s = Math.pow(hsv.s, 1.2);
      hsv.v = Math.pow(hsv.v, 1 / 2);
      hsv0 = hsv;
      hsl = this.convertHSVtoHSL(hsv);
      aux2 = 1000 * (Math.pow(hsl.l, 1.8) - 0.2 * Math.pow(hsv.v, 4)) - Math.pow(hsl.s, 10) * 255;
      if (aux2 < 0) {
        aux2 = 0;
      }
      aux = r * 0.33 + g * 0.33 + b * 0.33;
      hsv = this.convertRGBtoHSV(aux, aux, aux);
      if ("" + aux2 !== "NaN") {
        hsv.v += aux2 / 255;
      }
      hsv.v = Math.pow(hsv.v, 1.3);
      if (hsv.v > 0.99) {
        hsv.v = 0.99;
      }
      if (hsv.v < 0.01) {
        hsv.v = 0.01;
      }
      rgb = this.convertHSVtoRGB(hsv0.h, hsv0.s, hsv.v);
      return rgb;
    },
    getColor: function(image, x, y, w) {
      var cA, cB, cG, cR, i;
      i = (y * w + x) * 4;
      cR = image.data[i];
      cG = image.data[i + 1];
      cB = image.data[i + 2];
      cA = image.data[i + 3];
      return new Color(cR, cG, cB, cA);
    },
    doThreshold: function(image, threshold) {
      var i, pixel, _i, _len, _results;
      _results = [];
      for (i = _i = 0, _len = image.length; _i < _len; i = ++_i) {
        pixel = image[i];
        _results.push(image[i] = pixel > threshold ? 255 : 0);
      }
      return _results;
    },
    applyFunctionPair: function(mask, n, fn) {
      var bottom, h, i, left, length, newMask, pos, right, top_, w, x, y, _i, _j, _k, _l, _m, _ref, _ref1;
      if (n < 1 || (fn == null)) {
        return mask;
      }
      _ref = [mask.cols, mask.rows], w = _ref[0], h = _ref[1];
      length = w * h;
      for (i = _i = 1; 1 <= n ? _i <= n : _i >= n; i = 1 <= n ? ++_i : --_i) {
        newMask = this.matrix(w, h);
        for (y = _j = 0; 0 <= h ? _j <= h : _j >= h; y = 0 <= h ? ++_j : --_j) {
          for (x = _k = 0; 0 <= w ? _k <= w : _k >= w; x = 0 <= w ? ++_k : --_k) {
            pos = y * w + x;
            newMask.data[pos] = mask.data[pos];
          }
        }
        for (y = _l = 0; 0 <= h ? _l <= h : _l >= h; y = 0 <= h ? ++_l : --_l) {
          for (x = _m = 0; 0 <= w ? _m <= w : _m >= w; x = 0 <= w ? ++_m : --_m) {
            pos = y * w + x;
            _ref1 = [pos - 1, pos + 1], left = _ref1[0], right = _ref1[1];
            top_ = pos - w;
            bottom = pos + w;
            if (left >= 0 && right < length) {
              newMask.data[pos] = fn(mask.data[pos], mask.data[left], mask.data[right]);
            }
            if (top_ >= 0 && bottom < length) {
              newMask.data[pos] = fn(newMask.data[pos], mask.data[top_], mask.data[bottom]);
            }
            if (top_ - 1 >= 0) {
              newMask.data[pos] = fn(newMask.data[pos], mask.data[top_ + 1], mask.data[top_ - 1]);
            }
            if (bottom + 1 < length) {
              newMask.data[pos] = fn(newMask.data[pos], mask.data[bottom + 1], mask.data[bottom - 1]);
            }
          }
        }
        mask = newMask;
      }
      return mask;
    },
    dilates: function(image, size) {
      return this.applyFunctionPair(image, size, Math.max);
    },
    erodes: function(image, size, w, h) {
      return this.applyFunctionPair(image, size, Math.min);
    },
    imageDifference: function(imagePixels, imageColor, imageSignificance, imageGray, fn, adjust) {
      var i, imageDiff, imageLength, _i;
      imageDiff = this.matrix(imageGray.cols, imageGray.rows);
      imageLength = imageGray.data.length;
      for (i = _i = 0; 0 <= imageLength ? _i <= imageLength : _i >= imageLength; i = 0 <= imageLength ? ++_i : --_i) {
        imageDiff.data[i] = fn(imagePixels, imageColor, imageSignificance, imageGray, i);
        if (imageDiff.data[i] < adjust) {
          imageDiff.data[i] = adjust;
        }
      }
      return imageDiff;
    },
    dupImageGray: function(imageGray) {
      var dupImage, i, imageLength, _i;
      dupImage = this.matrix(imageGray.cols, imageGray.rows);
      imageLength = imageGray.data.length;
      for (i = _i = 0; 0 <= imageLength ? _i <= imageLength : _i >= imageLength; i = 0 <= imageLength ? ++_i : --_i) {
        dupImage.data[i] = imageGray.data[i];
      }
      return dupImage;
    },
    dupImageDataColor: function(imageData) {
      var dupImage, i, imageLength, _i;
      dupImage = this.matrixColor(imageData.width, imageData.height);
      imageLength = imageData.data.length;
      for (i = _i = 0; 0 <= imageLength ? _i <= imageLength : _i >= imageLength; i = 0 <= imageLength ? ++_i : --_i) {
        dupImage.data[i] = imageData.data[i];
      }
      return dupImage;
    },
    minimum: function(image1, image2) {
      var i, imageLength, minImage, _i;
      minImage = this.matrix(image1.cols, image1.rows);
      imageLength = image1.data.length;
      for (i = _i = 0; 0 <= imageLength ? _i <= imageLength : _i >= imageLength; i = 0 <= imageLength ? ++_i : --_i) {
        minImage.data[i] = Math.min(image1.data[i], image2.data[i]);
      }
      return minImage;
    },
    imageDifference2: function(imagePixels, imageColor, imageGray, fn, adjust, factor) {
      var i, imageDiff, imageLength, _i;
      imageDiff = this.matrix(imageGray.cols, imageGray.rows);
      imageLength = imageGray.data.length;
      for (i = _i = 0; 0 <= imageLength ? _i <= imageLength : _i >= imageLength; i = 0 <= imageLength ? ++_i : --_i) {
        imageDiff.data[i] = fn(imagePixels, imageColor, imageGray, i);
        if (imageDiff.data[i] - adjust < 0) {
          imageDiff.data[i] = 0;
        } else {
          imageDiff.data[i] = Math.pow(imageDiff.data[i], factor) / 255 * (factor - 1);
        }
      }
      return imageDiff;
    },
    applyThreshold: function(imageDiff, threshold) {
      var i, imageLength, _i;
      imageLength = imageDiff.data.length;
      if ((threshold != null)) {
        for (i = _i = 0; 0 <= imageLength ? _i <= imageLength : _i >= imageLength; i = 0 <= imageLength ? ++_i : --_i) {
          imageDiff.data[i] = imageDiff.data[i] > threshold ? 255 : 0;
        }
      }
      return imageDiff;
    },
    normalize: function(imageDiff) {
      var aux, i, imageLength, max, min, _i, _j;
      imageLength = imageDiff.data.length;
      min = 10000;
      max = 0;
      for (i = _i = 0; 0 <= imageLength ? _i <= imageLength : _i >= imageLength; i = 0 <= imageLength ? ++_i : --_i) {
        aux = imageDiff.data[i];
        if (aux < min) {
          min = aux;
        }
        if (aux > max) {
          max = aux;
        }
      }
      aux = 255.0 / (max - min);
      for (i = _j = 0; 0 <= imageLength ? _j <= imageLength : _j >= imageLength; i = 0 <= imageLength ? ++_j : --_j) {
        imageDiff.data[i] = (imageDiff.data[i] - min) * aux;
      }
      return imageDiff;
    },
    forEachPixel: function(image1, image2, fn) {
      var i, imageLength, minImage, p, _i, _len, _ref;
      minImage = this.matrix(image1.cols, image1.rows);
      imageLength = image1.data.length;
      _ref = image1.data;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        p = _ref[i];
        minImage.data[i] = fn(p, image2.data[i]);
      }
      return minImage;
    },
    getImageValue: function(image, x, y) {
      var i, res;
      if (arguments.length === 2) {
        y = Math.round(x.y);
        x = Math.round(x.x);
      }
      i = y * image.cols + x;
      res = image.data[i];
      return res;
    },
    findFace: function(canvas, faceHaarOptions, canny) {
      var face;
      this.faceDetector = new objectdetect.detector(canvas.width, canvas.height, faceHaarOptions.scale_factor, objectdetect.frontalface);
      face = this.faceDetector.detect(canvas, 1, faceHaarOptions.step, null, canny)[0];
      if (face) {
        face[5] = "frontal";
      } else {
        this.faceDetector = new objectdetect.detector(canvas.width, canvas.height, faceHaarOptions.scale_factor, objectdetect.frontalface_alt);
        face = this.faceDetector.detect(canvas, 1, faceHaarOptions.step, null, canny)[0];
        if (face) {
          face[5] = "frontal alt";
        } else {
          this.faceDetector = new objectdetect.detector(canvas.width, canvas.height, faceHaarOptions.scale_factor, objectdetect.profileface);
          face = this.faceDetector.detect(canvas, 1, faceHaarOptions.step, null, canny)[0];
          if (face) {
            face[5] = "profile";
          }
        }
      }
      return face;
    },
    findFaceViaJSFeat: function(image, grayImage, faceHaarOptions) {
      var classifier, h, ii_canny, ii_sqsum, ii_sum, ii_tilted, int32, max_work_size, rects, size, w, _ref;
      classifier = jsfeat.haar.frontalface;
      _ref = [image.width, image.height], w = _ref[0], h = _ref[1];
      size = (w + 1) * (h + 1);
      int32 = function() {
        return new Int32Array(size);
      };
      ii_sum = int32();
      ii_sqsum = int32();
      ii_tilted = int32();
      ii_canny = int32();
      max_work_size = 160;
      jsfeat.imgproc.compute_integral_image(grayImage, ii_sum, ii_sqsum, null);
      jsfeat.haar.edges_density = faceHaarOptions.edges_density;
      rects = jsfeat.haar.detect_multi_scale(ii_sum, ii_sqsum, ii_tilted, null, grayImage.cols, grayImage.rows, classifier, faceHaarOptions.scale_factor, faceHaarOptions.min_scale);
      rects = jsfeat.haar.group_rectangles(rects, 1);
      if (rects.length > 0) {
        return rects;
      } else {
        return null;
      }
    },
    findHandFist: function(canvas, handHaarOptions, canny) {
      this.handFistDetector = new objectdetect.detector(canvas.width, canvas.height, handHaarOptions.scale_factor, objectdetect.handfist);
      return this.handFistDetector.detect(canvas, 1, handHaarOptions.step, null, canny);
    },
    findHandOpen: function(canvas, handHaarOptions, canny) {
      this.handOpenDetector = new objectdetect.detector(canvas.width, canvas.height, handHaarOptions.scale_factor, objectdetect.handopen);
      return this.handOpenDetector.detect(canvas, 1, handHaarOptions.step, null, canny);
    }
  };

}).call(this);

(function() {
  filepicker.setKey('AN8l6x4Shekrztt8K7Xxwz');

  this.ImageStore = {
    opts: {
      mimetype: 'image/png',
      base64decode: true
    },
    upload: function(imageContent, onSuccess, onError, onProgressUpload) {
      return filepicker.store(imageContent, ImageStore.opts, onSuccess, onError, onProgressUpload);
    }
  };

}).call(this);

(function() {
  this.HumanBody = (function() {
    function HumanBody(head, map, handLeft, handRight) {
      this.head = head;
      this.map = map;
      this.handLeft = handLeft;
      this.handRight = handRight;
      if (this.head == null) {
        this.head = {
          x: 1000,
          y: 1000,
          width: 100,
          height: 100
        };
      }
      this.skeleton = new Skeleton(this.head, this.map);
      this.skeleton.updateHandLeft(this.handLeft);
      this.skeleton.updateHandRight(this.handRight);
      this.skeleton.correlatePoints();
    }

    HumanBody.prototype.waistLimits = function() {
      return {
        start: this.skeleton.waist.y - this.head.height,
        end: this.skeleton.waist.y + this.head.height
      };
    };

    HumanBody.prototype.heightLimits = function() {
      return {
        start: this.head.y,
        min: this.head.y + this.head.height * 5,
        max: this.head.y + this.head.height * 8
      };
    };

    HumanBody.prototype.shouldersLimits = function() {
      return {
        start: this.skeleton.shoulderLeft.x - this.head.width / 2,
        end: this.skeleton.shoulderRight.x + this.head.width / 2
      };
    };

    return HumanBody;

  })();

  this.Skeleton = (function() {
    function Skeleton(head, map) {
      this.head = head;
      this.map = map;
      if (this.head.y + this.head.height * 7 < map.rows) {
        this.fullbody = true;
      }
      this.neck = new Point(this.head.x + this.head.width / 2, this.head.y + this.head.height);
      this.chestCenter = new Point(this.neck.x, this.neck.y + this.head.height);
      this.shoulderRight = new Point(this.chestCenter.x + this.head.width * 3, this.chestCenter.y - this.head.height * 1.5);
      this.shoulderLeft = new Point(this.chestCenter.x - this.head.width * 3, this.chestCenter.y - this.head.height / 1.5);
      this.waist = new Point(this.chestCenter.x, this.chestCenter.y + this.head.height);
      this.armRight = new Point(this.shoulderRight.x + this.head.width / 2, this.shoulderRight.y + this.head.height * 1.4);
      this.armLeft = new Point(this.shoulderLeft.x - this.head.width / 2, this.shoulderLeft.y + this.head.height * 1.4);
      this.handRight = new Point(this.armRight.x, this.armRight.y + this.head.height * 1.5);
      this.handLeft = new Point(this.armLeft.x, this.armLeft.y + this.head.height * 1.5);
      this.hips = new Point(this.waist.x, this.waist.y + this.head.height);
      if (this.fullbody) {
        this.legRight = new Point(this.hips.x + this.head.width * .75, this.hips.y);
        this.legLeft = new Point(this.hips.x - this.head.width * .75, this.hips.y);
        this.kneeRight = new Point(this.legRight.x, this.legRight.y + this.head.height * 2);
        this.kneeLeft = new Point(this.legLeft.x, this.legLeft.y + this.head.height * 2);
        this.footRight = new Point(this.kneeRight.x, this.kneeRight.y + this.head.height * 2);
        this.footLeft = new Point(this.kneeLeft.x, this.kneeLeft.y + this.head.height * 2);
      }
      this.points = [this.neck, this.chestCenter, this.shoulderRight, this.shoulderLeft, this.waist, this.armRight, this.armLeft, this.handRight, this.handLeft, this.hips, this.legRight, this.legLeft, this.kneeRight, this.kneeLeft, this.footRight, this.footLeft];
    }

    Skeleton.prototype.segments = function() {
      var segments;
      segments = {
        neck: [this.neck, this.chestCenter],
        shoulderRight: [this.chestCenter, this.shoulderRight],
        shoulderLeft: [this.chestCenter, this.shoulderLeft],
        armRight: [this.shoulderRight, this.armRight],
        armLeft: [this.shoulderLeft, this.armLeft],
        handRight: [this.armRight, this.handRight],
        handLeft: [this.armLeft, this.handLeft],
        waist: [this.chestCenter, this.waist],
        hips: [this.waist, this.hips]
      };
      if (this.fullbody) {
        $.extend(segments, {
          legRight: [this.hips, this.legRight],
          legLeft: [this.hips, this.legLeft],
          kneeRight: [this.legRight, this.kneeRight],
          kneeLeft: [this.legLeft, this.kneeLeft],
          footRight: [this.kneeRight, this.footRight],
          footLeft: [this.kneeLeft, this.footLeft]
        });
      }
      return segments;
    };

    Skeleton.prototype.isValid = function(point) {
      var x, y;
      if ((point.width != null)) {
        y = point.y + point.height / 2;
        x = point.x + point.width / 2;
      } else {
        y = point.y;
        x = point.x;
      }
      return this.getPixel(Math.round(x), Math.round(y)) > 0;
    };

    Skeleton.prototype.getPixel = function(x, y) {
      return this.map.data[y * this.map.cols + x];
    };

    Skeleton.prototype.updateHandLeft = function(handLeft) {
      if (this.skeleton && handLeft && this.isValid(handLeft)) {
        return this.skeleton.handLeft.updateCenter(handLeft);
      }
    };

    Skeleton.prototype.updateHandRight = function(handRight) {
      if (this.skeleton && handRight && this.isValid(handRight)) {
        return this.skeleton.handRight.updateCenter(handRight);
      }
    };

    Skeleton.prototype.seekGradient = function(name, gradient, point, pX, pY, x, y, count) {
      var auxX, auxY, gradientX, gradientY, i, j, pX1, pY1, value, x0, y0, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
      if (arguments.length <= 6 || !x && !y) {
        x = point.x;
        y = point.y;
      }
      if (arguments.length === 3) {
        pX = 0;
        pY = 0;
        count = 0;
      }
      if (count <= 0 || x === point.x && y === point.y) {
        return;
      }
      if (!count || ("" + count) === "NaN") {
        count = 100;
      }
      x0 = x;
      y0 = y;
      x = Math.round(x);
      y = Math.round(y);
      point.x = x;
      point.y = y;
      if (count <= 0) {
        return;
      }
      gradientX = 0;
      gradientY = 0;
      pX1 = pX * (Math.random() * 2 - 0.1);
      pY1 = pY * (Math.random() * 2 - 0.1);
      if (pX !== 0 || pY !== 0) {
        value = ImageProcessing.getImageValue(gradient, x, y);
        if (value === void 0) {
          return this.seekGradient(name, gradient, point, -pX, -pY, x0 + pX1, y0 + pY1, count - 1);
        } else if (value < 30) {
          return this.seekGradient(name, gradient, point, pX, pY, x0 - pX1, y0 - pY1, count - 1);
        } else if (value > 240) {
          return this.seekGradient(name, gradient, point, pX, pY, x0 + pX1, y0 + pY1, count - 1);
        }
      }
      _ref = [-1, 1];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        j = _ref[_i];
        _ref1 = [x - 1, x, x + 1];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          i = _ref1[_j];
          value = ImageProcessing.getImageValue(gradient, i, y + j);
          gradientY += (1 / j) * value / 4;
        }
      }
      _ref2 = [-1, 1];
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        j = _ref2[_k];
        _ref3 = [x - 1, x, x + 1];
        for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
          i = _ref3[_l];
          value = ImageProcessing.getImageValue(gradient, x + j, i);
          gradientX += (1 / j) * value / 4;
        }
      }
      auxX = Math.abs(gradientX);
      auxY = Math.abs(gradientY);
      if (auxX > 1 || auxY > 1) {
        if (auxX > 3) {
          gradientX = gradientX / auxX * 3;
        }
        if (auxY > 3) {
          gradientY = gradientY / auxY * 3;
        }
        return this.seekGradient(name, gradient, point, pX, pY, x0 + gradientX, y0 + gradientY, count - 1);
      }
    };

    Skeleton.prototype.goToTheEnds = function(name, map, point, x, y, direction, s, count) {
      var value;
      if (direction == null) {
        direction = "x";
      }
      if (s == null) {
        s = 0;
      }
      if (count == null) {
        count = 0;
      }
      if (direction === "x") {
        value = ImageProcessing.getImageValue(map, parseInt(point.x + x), parseInt(point.y));
        if (value > 100) {
          s = 0;
          point.x += x;
        } else {
          s++;
          direction = "y";
        }
      } else {
        value = ImageProcessing.getImageValue(map, parseInt(point.x), parseInt(point.y + y));
        if (value > 100) {
          s = 0;
          point.y += y;
        } else {
          s++;
          direction = "x";
        }
      }
      if (s > 2 || count > 320) {
        return;
      }
      return this.goToTheEnds(name, map, point, x, y, direction, s, count + 1);
    };

    Skeleton.prototype.correlatePoints = function() {
      var armLeft, armRight, auxDiff, chestCenter, footLeft, footRight, gradient, handLeft, handRight, head, hips, imageDiff, kneeLeft, kneeRight, legLeft, legRight, shoulderLeft, shoulderRight, skeleton, waist;
      imageDiff = this.map;
      head = this.head;
      skeleton = this;
      auxDiff = ImageProcessing.erodes(imageDiff, 2);
      gradient = ImageProcessing.erodes(imageDiff, 1);
      gradient = ImageProcessing.blur(gradient, 35);
      gradient = ImageProcessing.forEachPixel(gradient, auxDiff, Math.max);
      gradient = ImageProcessing.blur(gradient, 20);
      gradient = ImageProcessing.forEachPixel(gradient, imageDiff, Math.max);
      gradient = ImageProcessing.blur(gradient, 2);
      segmentation.publishFrameStep("gradient", gradient.data);
      armLeft = skeleton.armLeft;
      armRight = skeleton.armRight;
      handLeft = skeleton.handLeft;
      handRight = skeleton.handRight;
      shoulderLeft = skeleton.shoulderLeft;
      shoulderRight = skeleton.shoulderRight;
      chestCenter = skeleton.chestCenter;
      waist = skeleton.waist;
      hips = skeleton.hips;
      this.seekGradient("chestCenter", gradient, chestCenter);
      this.seekGradient("sholderLeft", gradient, shoulderLeft, 0, -0.2);
      this.seekGradient("sholderRight", gradient, shoulderRight, 0, -0.2);
      shoulderLeft.y += head.height / 5;
      shoulderRight.y += head.height / 5;
      chestCenter.x = (shoulderLeft.x + shoulderRight.x) / 2;
      this.seekGradient("waist", gradient, waist);
      handLeft.x = shoulderLeft.x;
      handLeft.y = shoulderLeft.y;
      this.goToTheEnds("handLeft", imageDiff, handLeft, -2, 2);
      this.seekGradient("handLeft", gradient, handLeft, -2, 2);
      this.seekGradient("armLeft", gradient, armLeft, 0, 0, (shoulderLeft.x + handLeft.x) / 2, (shoulderLeft.y + handLeft.y) / 2, 2);
      handRight.x = shoulderRight.x;
      handRight.y = shoulderRight.y;
      this.goToTheEnds("handRight", imageDiff, handRight, 2, 2);
      this.seekGradient("handRight", gradient, handRight, 2, 2);
      this.seekGradient("armRight", gradient, armRight, 0, 0, (shoulderRight.x + handRight.x) / 2, (shoulderRight.y + handRight.y) / 2, 2);
      this.seekGradient("hips", gradient, hips);
      if (this.fullbody) {
        legLeft = skeleton.legLeft;
        legRight = skeleton.legRight;
        kneeLeft = skeleton.kneeLeft;
        kneeRight = skeleton.kneeRight;
        footLeft = skeleton.footLeft;
        footRight = skeleton.footRight;
        this.seekGradient("legLeft", gradient, legLeft, -1, 0);
        legLeft.x = legLeft.x + (hips.x - legLeft.x) / 4;
        this.seekGradient("legRight", gradient, legRight, 1, 0);
        legRight.x = legRight.x - (legRight.x - hips.x) / 4;
        hips.x = (legLeft.x + legRight.x) / 2;
        footLeft.x = legLeft.x;
        footLeft.y = legLeft.y;
        this.goToTheEnds("footLeft", imageDiff, footLeft, -2, 3, "y");
        this.seekGradient("footLeft", gradient, footLeft, -1, 2);
        this.seekGradient("kneeLeft", gradient, kneeLeft, 0, 0, (footLeft.x + legLeft.x) / 2, (footLeft.y + legLeft.y) / 2, 2);
        footRight.x = legRight.x;
        footRight.y = legRight.y;
        this.goToTheEnds("footRight", imageDiff, footRight, 2, 3, "y");
        this.seekGradient("footRight", gradient, footRight, 1, 2);
        return this.seekGradient("kneeRight", gradient, kneeRight, 0, 0, (footRight.x + legRight.x) / 2, (footRight.y + legRight.y) / 2, 2);
      }
    };

    return Skeleton;

  })();

}).call(this);

(function() {
  this.Color = (function() {
    function Color(red, green, blue, alpha) {
      this.red = red;
      this.green = green;
      this.blue = blue;
      this.alpha = alpha;
    }

    Color.prototype.difference = function(color) {
      var c0, c1;
      c0 = ImageProcessing.convertRGBtoHSV(this.red, this.green, this.blue);
      c1 = ImageProcessing.convertRGBtoHSV(color.red, color.green, color.blue);
      if (Math.abs(c0.h - c1.h) < 0.05 && Math.abs(c0.v - c1.v) < 0.3) {
        return 0;
      } else {
        return 2048 * (Math.pow(Math.abs(Math.abs(c0.h - 1) - Math.abs(c1.h - 1)), 0.6) * (Math.abs(c0.v - c1.v))) * (1 - c0.s * c1.s * c0.v * c1.v);
      }
    };

    Color.prototype.to_s = function() {
      return this.red + "," + this.green + "," + this.blue;
    };

    return Color;

  })();

  this.Segmentation = (function() {
    function Segmentation(canvas, video) {
      this.canvas = canvas;
      this.video = video;
      this.w = this.canvas.width;
      this.h = this.canvas.height;
      this.ctx = this.canvas.getContext('2d');
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.bgCaptures = 100;
      this.threshold = 85;
      this.adjustMutiplier = 0.8;
      this.applyFlood = true;
      this.floodLimit = 50;
      this.colorThreshold = 1.7;
      this.secondFlood = false;
      this.debug = window.location.hostname === "localhost";
      if (this.debug) {
        $(".dg.ac").show();
      }
      this.dilates0 = 0;
      this.erodes = 2;
      this.dilates = 2;
      this.blurSize = 0;
      this.viewMode = 0;
      this.bgPixelsList = [];
      this.bgColorsList = [];
      this.bgSignificanceList = [];
      this.bgGrayList = [];
      this.faceHaarOptions = {
        scale_factor: 1.4,
        step: 2
      };
      this.handHaarOptions = {
        scale_factor: 1.4,
        step: 2
      };
      this.canny = true;
      if (typeof gui !== "undefined" && gui !== null) {
        this.setupGui();
      }
    }

    Segmentation.prototype.fillImageOnMatrix = function(pixels) {
      var i, matrix, pixel, _i, _len;
      matrix = ImageProcessing.matrix(this.w, this.h);
      for (i = _i = 0, _len = pixels.length; _i < _len; i = ++_i) {
        pixel = pixels[i];
        matrix[i] = pixel;
      }
      return matrix;
    };

    Segmentation.prototype.proccessColor = function(image) {
      var color, i, i4, imageColor, imageLength, imageSignificance, _i;
      imageColor = ImageProcessing.matrix(this.w, this.h);
      imageSignificance = [];
      imageLength = imageColor.data.length;
      for (i = _i = 0; 0 <= imageLength ? _i <= imageLength : _i >= imageLength; i = 0 <= imageLength ? ++_i : --_i) {
        i4 = i * 4;
        color = ImageProcessing.convertRGBtoHSV(image[i4], image[i4 + 1], image[i4 + 2]);
        imageColor.data[i] = color.h * 255;
        imageSignificance[i] = color.s;
      }
      return [imageColor, imageSignificance];
    };

    Segmentation.prototype.getDifferenceValues = function(imagePixels, imageColor, imageSignificance, imageGray, i) {
      var auxDiff, b, bg, bgColor, bgGray, bgS, d, ddd, diff0, difference, fg, fgS, g, hueDiff, i4, j, length, r, rgb, rgbDiff, saturation, shadow, _i, _j, _k, _len, _len1, _ref, _ref1;
      d = 0;
      bg = 0;
      diff0 = 255;
      hueDiff = 255;
      length = this.bgGrayList.length;
      i4 = i * 4;
      rgb = [];
      ddd = 0;
      for (j = _i = 0; _i < 3; j = ++_i) {
        bg = this.bgPixelsList[1].data[i4 + j];
        fg = imagePixels[i4 + j];
        rgb[j] = 127 + bg - fg;
      }
      r = rgb[0], g = rgb[1], b = rgb[2];
      rgbDiff = Math.abs(r - g) + Math.abs(r - b) + Math.abs(g - b);
      rgbDiff = Math.abs(127 - rgbDiff * 4) / 6;
      if (rgbDiff > 255) {
        rgbDiff = 255;
      }
      rgbDiff = Math.sqrt(rgbDiff / 255) * 255;
      fg = imageGray.data[i];
      if (fg >= this.bgGrayList[0].data[i] && fg <= this.bgGrayList[1].data[i]) {
        diff0 = 0;
      } else {
        _ref = this.bgGrayList;
        for (_j = 0, _len = _ref.length; _j < _len; _j++) {
          bgGray = _ref[_j];
          bg = bgGray.data[i];
          difference = bg - fg;
          ddd = Math.max(ddd, difference);
          diff0 = Math.min(diff0, Math.abs(difference));
        }
      }
      fg = imageColor.data[i];
      fgS = imageSignificance[i];
      fg = Math.abs(fg - 127);
      bgS = Math.min(this.bgSignificanceList[0][i], this.bgSignificanceList[1][i]);
      _ref1 = this.bgColorsList;
      for (_k = 0, _len1 = _ref1.length; _k < _len1; _k++) {
        bgColor = _ref1[_k];
        bg = bgColor.data[i];
        bg = Math.abs(bg - 127);
        auxDiff = (fg - bg) / 3;
        if (auxDiff < 0) {
          auxDiff = 0;
        }
        hueDiff = Math.min(hueDiff, Math.abs(auxDiff));
      }
      shadow = 0;
      saturation = Math.abs(fgS - bgS) * 500;
      d = diff0;
      diff0 = Math.sqrt(diff0 / 900) * 255;
      d = Math.max(d, diff0);
      d = Math.max(d, hueDiff * 5);
      d = Math.max(d, saturation);
      d = Math.max(d, rgbDiff * 1.9);
      d = Math.max(d, (diff0 + hueDiff + saturation + rgbDiff) / 1.4);
      d = Math.pow(d / 200, 2) * 255;
      if (d < 0) {
        d = 0;
      } else if (d > 150) {
        d = 150;
      }
      return d;
    };

    Segmentation.prototype.limitValue = function(value) {
      if (value > 255) {
        return 255;
      } else if (value < 0) {
        return 0;
      } else {
        return value;
      }
    };

    Segmentation.prototype.pixelDifferenceFunction = function() {
      var self;
      self = this;
      return function(imagePixels, imageColor, imageSignificance, imageGray, i) {
        return self.limitValue(self.getDifferenceValues(imagePixels, imageColor, imageSignificance, imageGray, i));
      };
    };

    Segmentation.prototype.calculateAdjust = function(imageDiff) {
      var adjust, aux, i, imageLength, p, x, y, _i;
      adjust = 0;
      imageLength = imageDiff.data.length;
      for (i = _i = 0; 0 <= imageLength ? _i <= imageLength : _i >= imageLength; i = 0 <= imageLength ? ++_i : --_i) {
        x = i % this.w;
        y = i / this.w;
        p = this.h / 6;
        if ((y <= p) && (x <= p || x >= this.w - p)) {
          aux = imageDiff.data[i];
          adjust = Math.max(adjust, aux);
        }
      }
      return adjust;
    };

    Segmentation.prototype.imageDifference = function(imagePixels, imageColor, imageSignificance, imageGray, diff) {
      var adjust, fn, imageDiff;
      fn = this.pixelDifferenceFunction();
      imageDiff = ImageProcessing.imageDifference(imagePixels, imageColor, imageSignificance, imageGray, fn, 0, diff);
      this.publishFrameStep("original Diff", imageDiff.data);
      adjust = this.calculateAdjust(imageDiff) * this.adjustMutiplier;
      imageDiff = ImageProcessing.imageDifference(imagePixels, imageColor, imageSignificance, imageGray, fn, adjust);
      return imageDiff;
    };

    Segmentation.prototype.floodFill = function(image, mask, x, y, i) {
      var cT, mainC, maskC;
      maskC = mask[i];
      mainC = ImageProcessing.getColor(image, x, y, this.w);
      cT = this.colorThreshold;
      if (image.channel === 4) {
        this.colorThreshold = 0;
      }
      this.floodFill4(image, mask, x + 1, y, mainC, maskC, 0, this.colorThreshold);
      this.floodFill4(image, mask, x - 1, y, mainC, maskC, 0, this.colorThreshold);
      this.floodFill4(image, mask, x, y + 1, mainC, maskC, 0, this.colorThreshold);
      this.floodFill4(image, mask, x, y - 1, mainC, maskC, 0, this.colorThreshold);
      return this.colorThreshold = cT;
    };

    Segmentation.prototype.flood = function(imageData, mask) {
      var i, x, y, _i, _ref, _results;
      if (this.applyFlood) {
        _results = [];
        for (x = _i = 0, _ref = this.w; 0 <= _ref ? _i <= _ref : _i >= _ref; x = 0 <= _ref ? ++_i : --_i) {
          _results.push((function() {
            var _j, _ref1, _results1;
            _results1 = [];
            for (y = _j = 0, _ref1 = this.h; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; y = 0 <= _ref1 ? ++_j : --_j) {
              i = y * this.w + x;
              if (mask.data[i] > this.threshold) {
                _results1.push(this.floodFill(imageData, mask.data, x, y, i));
              } else {
                _results1.push(void 0);
              }
            }
            return _results1;
          }).call(this));
        }
        return _results;
      }
    };

    Segmentation.prototype.floodFill4 = function(image, mask, x, y, mainC, maskC, count, colorThreshold) {
      var color, diff, i, maskColor;
      if (!this.applyFlood || x > this.w || y > this.h || y < 0 || x < 0 || count > this.floodLimit) {
        return;
      }
      i = y * this.w + x;
      maskColor = mask[i];
      if (maskColor < maskC) {
        color = ImageProcessing.getColor(image, x, y, this.w);
        diff = color.difference(mainC);
        if (diff < colorThreshold) {
          mask[i] = maskC;
          if (count < this.floodLimit) {
            this.floodFill4(image, mask, x + 1, y, mainC, maskC, count + 1, colorThreshold);
            this.floodFill4(image, mask, x - 1, y, mainC, maskC, count + 1, colorThreshold);
            this.floodFill4(image, mask, x, y + 1, mainC, maskC, count + 1, colorThreshold);
            return this.floodFill4(image, mask, x, y - 1, mainC, maskC, count + 1, colorThreshold);
          }
        }
      }
    };

    Segmentation.prototype.applyViewMode = function(imageData, map) {
      var i, x, _i, _j, _k, _l, _ref, _ref1, _ref2, _ref3, _results, _results1, _results2, _results3;
      if (this.viewMode === 1) {
        _results = [];
        for (i = _i = 0, _ref = imageData.data.length; _i <= _ref; i = _i += 4) {
          x = map[i / 4];
          _results.push(imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = x);
        }
        return _results;
      } else if (this.viewMode === 2) {
        _results1 = [];
        for (i = _j = 0, _ref1 = imageData.data.length; _j <= _ref1; i = _j += 4) {
          x = map[i / 4] / 255.0;
          if (x < 0) {
            x = 0;
          }
          if (x > 255) {
            x = 255;
          }
          imageData.data[i] *= x;
          imageData.data[i + 1] *= x;
          _results1.push(imageData.data[i + 2] *= x);
        }
        return _results1;
      } else if (this.viewMode === 3) {
        _results2 = [];
        for (i = _k = 0, _ref2 = imageData.data.length; _k <= _ref2; i = _k += 4) {
          x = 255.0 - map[i / 4];
          if (x < 0) {
            x = 0;
          }
          if (x > 255) {
            x = 255;
          }
          imageData.data[i] += x;
          imageData.data[i + 1] += x;
          _results2.push(imageData.data[i + 2] += x);
        }
        return _results2;
      } else if (this.viewMode === 4) {
        _results3 = [];
        for (i = _l = 0, _ref3 = imageData.data.length; _l <= _ref3; i = _l += 4) {
          x = 255.0 - map[i / 4];
          if (x < 0) {
            x = 0;
          }
          if (x > 255) {
            x = 255;
          }
          if (x > 0) {
            imageData.data[i] = this.bgPixelsList[0].data[i];
            imageData.data[i + 1] = this.bgPixelsList[0].data[i + 1];
            _results3.push(imageData.data[i + 2] = this.bgPixelsList[0].data[i + 2]);
          } else {
            imageData.data[i] += x;
            imageData.data[i + 1] += x;
            _results3.push(imageData.data[i + 2] += x);
          }
        }
        return _results3;
      }
    };

    Segmentation.prototype.refreshVideo = function(ctx, mirrored) {
      if (ctx == null) {
        ctx = this.ctx;
      }
      if (mirrored == null) {
        mirrored = false;
      }
      if (mirrored) {
        ctx.canvas.scale(-1, 1);
        ct.canvas.drawImage(v, 0, 0, ctx.canvas.width * -1, ctx.canvas.height);
        return canvas.restore();
      } else {
        return ctx.drawImage(this.video, 0, 0, ctx.canvas.width, ctx.canvas.height);
      }
    };

    Segmentation.prototype.getCameraImage = function(index, ctx) {
      if (ctx == null) {
        ctx = this.ctx;
      }
      this.refreshVideo(ctx);
      return this.getImage(ctx);
    };

    Segmentation.prototype.clearWith = function(image, ctx) {
      if (ctx == null) {
        ctx = this.ctx;
      }
      return ctx.putImageData(image, 0, 0);
    };

    Segmentation.prototype.feedBackgroundImages = function(bgGrayList, bgPixelsList) {
      var bgColorsMax, bgColorsMin, bgSignificanceMax, bgSignificanceMin, _ref, _ref1;
      this.bgGrayList = bgGrayList;
      this.bgPixelsList = bgPixelsList;
      _ref = this.proccessColor(this.bgPixelsList[0].data), bgColorsMin = _ref[0], bgSignificanceMin = _ref[1];
      _ref1 = this.proccessColor(this.bgPixelsList[1].data), bgColorsMax = _ref1[0], bgSignificanceMax = _ref1[1];
      this.bgColorsList = [bgColorsMin, bgColorsMax];
      return this.bgSignificanceList = [bgSignificanceMin, bgSignificanceMax];
    };

    Segmentation.prototype.publishFrameStep = function(title, pixels, effect127, normalized) {
      var canvas, context, data, i, value, _i, _ref;
      if (this.debug === false) {
        return;
      }
      canvas = document.createElement("canvas");
      canvas.width = this.w;
      canvas.height = this.h;
      $(canvas).addClass('thumb');
      $(canvas).attr('title', title);
      context = canvas.getContext('2d');
      if (pixels.constructor === ImageData) {
        data = pixels;
      } else {
        data = this.getImage();
        for (i = _i = 0, _ref = (canvas.width * canvas.height) * 4; _i <= _ref; i = _i += 4) {
          value = pixels[i / 4];
          if (effect127) {
            value = Math.abs(value - 127) * 2;
          }
          if (normalized) {
            value *= 255;
          }
          data.data[i] = value;
          data.data[i + 1] = value;
          data.data[i + 2] = value;
          data.data[i + 3] = 255;
        }
      }
      context.putImageData(data, 0, 0);
      context.font = "12px Verdana";
      context.fillStyle = "red";
      context.fillText(title, 0, 15);
      return $(".frames").append(canvas);
    };

    Segmentation.prototype.getImage = function(ctx) {
      if (ctx == null) {
        ctx = this.ctx;
      }
      return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    };

    Segmentation.prototype.findFace = function(canvas) {
      var face;
      if (canvas == null) {
        canvas = this.canvas;
      }
      face = ImageProcessing.findFace(canvas, this.faceHaarOptions, this.canny);
      if (face && face.length > 0 && face[4] > 4) {
        this.head = {
          x: face[0],
          y: face[1],
          width: face[2],
          height: face[3] * 1.2,
          data: face
        };
        return this.head;
      }
    };

    Segmentation.prototype.findHandFist = function(canvas) {
      return ImageProcessing.findHandFist(canvas, this.handHaarOptions, this.canny);
    };

    Segmentation.prototype.findHandOpen = function(canvas) {
      return ImageProcessing.findHandOpen(canvas, this.handHaarOptions, this.canny);
    };

    Segmentation.prototype.proccess = function(imageData) {
      var auxDiff, clusters, imageColor, imageDiff, imageGray, imageLength, imagePixels, imageSignificance, slic, _ref;
      $(".frames").empty();
      imageGray = null;
      if (this.bgGrayList.length > 0) {
        this.publishFrameStep("bgPixels min", this.bgPixelsList[0]);
        this.publishFrameStep("bgColors min", this.bgColorsList[0].data, true);
        this.publishFrameStep("bgCSignificance min", this.bgSignificanceList[0], false, true);
        this.publishFrameStep("Background Gray min", this.bgGrayList[0].data);
        this.publishFrameStep("bgPixels MAX", this.bgPixelsList[1]);
        this.publishFrameStep("bgColors MAX", this.bgColorsList[1].data, true);
        this.publishFrameStep("bgCSignificance MAX", this.bgSignificanceList[1], false, true);
        this.publishFrameStep("Background Gray MAX", this.bgGrayList[1].data);
        imageData || (imageData = this.getImage());
        _ref = this.proccessColor(imageData.data), imageColor = _ref[0], imageSignificance = _ref[1];
        this.publishFrameStep("currentImage", imageData);
        this.publishFrameStep("currentImageColors", imageColor.data, true);
        this.publishFrameStep("currentImageCSignificance", imageSignificance, false, true);
        imagePixels = imageData.data;
        imageGray = ImageProcessing.grayBlurData(imageData, this.blurSize);
        this.publishFrameStep("currentImageGray", imageGray.data);
        imageLength = imageGray.data.length;
        imageDiff = this.imageDifference(imagePixels, imageColor, imageSignificance, imageGray);
        this.publishFrameStep("imageDiff", imageDiff.data);
        slic = new Slic(imageData, {
          regionSize: 20,
          minRegionSize: 16
        });
        this.publishFrameStep("slic", slic.result.data);
        clusters = slic.clusters;
        this.floodCluster(imageDiff, clusters);
        this.publishFrameStep("flooded", imageDiff.data);
        imageDiff = ImageProcessing.normalize(imageDiff);
        this.publishFrameStep("normalized", imageDiff.data);
        auxDiff = ImageProcessing.dupImageGray(imageDiff);
        imageDiff = ImageProcessing.applyThreshold(imageDiff, this.threshold);
        this.publishFrameStep("final-mask", imageDiff.data);
        this.applyViewMode(imageData, imageDiff.data);
        this.publishFrameStep("imageData", imageData);
        this.imageData = imageData;
        this.imageDiff = imageDiff;
        this.auxDiff = auxDiff;
      } else {
        imageData = this.getImage();
        this.imageData = imageData;
        this.imageDiff = ImageProcessing.matrix(this.w, this.h);
      }
      return [imageData, this.imageDiff, imageGray, this.auxDiff];
    };

    Segmentation.prototype.floodCluster = function(imageDiff, clusters) {
      var avg, cluster, i, _i, _j, _len, _len1, _results;
      _results = [];
      for (_i = 0, _len = clusters.length; _i < _len; _i++) {
        cluster = clusters[_i];
        avg = 0;
        for (_j = 0, _len1 = cluster.length; _j < _len1; _j++) {
          i = cluster[_j];
          avg += imageDiff.data[i] / (cluster.length + 1);
        }
        _results.push((function() {
          var _k, _len2, _results1;
          _results1 = [];
          for (_k = 0, _len2 = cluster.length; _k < _len2; _k++) {
            i = cluster[_k];
            _results1.push(imageDiff.data[i] = avg);
          }
          return _results1;
        })());
      }
      return _results;
    };

    Segmentation.prototype.clearCanvas = function() {
      return this.ctx.clearRect(0, 0, this.w, this.h);
    };

    Segmentation.prototype.setupGui = function() {
      var fold;
      fold = gui.addFolder("Segmentation");
      fold.add(this, "debug");
      fold.add(this, "viewMode", 0, 4);
      fold.add(this, "threshold", 0, 255);
      fold.add(this, "adjustMutiplier", 0, 1).step(0.1);
      fold = gui.addFolder("Image Transform");
      fold.add(this, "applyFlood");
      fold.add(this, "floodLimit", 1, 80);
      fold.add(this, "colorThreshold", 1, 50);
      fold.add(this, "secondFlood");
      fold.add(this, "dilates0", 0, 10);
      fold.add(this, "erodes", 0, 10);
      fold.add(this, "dilates", 0, 10);
      fold.add(this, "blurSize", 0, 1);
      fold = gui.addFolder("Face detector");
      fold.add(this.faceHaarOptions, "scale_factor", 0, 5).step(0.05);
      fold.add(this.faceHaarOptions, "step", 0, 5).step(1);
      fold = gui.addFolder("Hand detector");
      fold.add(this.handHaarOptions, "scale_factor", 0, 5).step(0.05);
      return fold.add(this.handHaarOptions, "step", 0, 5).step(1);
    };

    return Segmentation;

  })();

}).call(this);

(function() {
  this.CanvasPreview = (function() {
    CanvasPreview.conf = {
      drawSkeleton: false,
      drawMeasurements: true
    };

    CanvasPreview.setupGUI = function() {
      var key, v, _ref, _results;
      if (this.fold != null) {
        return;
      }
      this.fold = gui.addFolder("View");
      _ref = this.conf;
      _results = [];
      for (key in _ref) {
        v = _ref[key];
        _results.push(this.fold.add(this.conf, key));
      }
      return _results;
    };

    function CanvasPreview(ctxImage, ctx) {
      this.ctxImage = ctxImage;
      this.ctx = ctx != null ? ctx : this.ctxImage;
      this.mirrorCamera = true;
      this.scale = 1;
      this.setDefaultStyle();
      if (typeof gui !== "undefined" && gui !== null) {
        CanvasPreview.setupGUI();
      }
      this.loadSiluettes();
    }

    CanvasPreview.prototype.clear = function() {
      return this.ctxImage.clearRect(0, 0, this.ctxImage.canvas.width, this.ctxImage.canvas.height);
    };

    CanvasPreview.prototype.clearWith = function(imageData) {
      return this.ctxImage.putImageData(imageData, 0, 0);
    };

    CanvasPreview.prototype.drawCirc = function(x, y, radius, style) {
      if (radius == null) {
        radius = 10;
      }
      if (style == null) {
        style = this.style;
      }
      x *= this.scale;
      y *= this.scale;
      this.ctx.shadowColor = style.circShadowColor;
      this.ctx.fillStyle = style.circFillColor;
      this.ctx.strokeStyle = style.circColor;
      this.ctx.lineWidth = style.lineWidth;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
      this.ctx.stroke();
      this.ctx.fill();
      return this.ctx.closePath();
    };

    CanvasPreview.prototype.drawRect = function(points, color) {
      var h, w, x, y;
      x = points[0] * this.scale;
      y = points[1] * this.scale;
      w = points[2] * this.scale;
      h = points[3] * this.scale;
      this.ctx.shadowColor = this.style.shadowColor;
      this.ctx.fillStyle = color || this.style.rectColor;
      this.ctx.strokeStyle = color || this.style.rectFillColor;
      this.ctx.lineWidth = this.style.lineWidth;
      this.ctx.beginPath();
      this.ctx.rect(x, y, w, h);
      this.ctx.fill();
      return this.ctx.stroke();
    };

    CanvasPreview.prototype.drawText = function(msg, x, y) {
      x *= this.scale;
      y *= this.scale;
      this.ctx.shadowColor = this.style.shadowColor;
      this.ctx.fillStyle = this.style.textColor;
      this.ctx.lineWidth = this.style.lineWidth;
      return this.ctx.fillText(msg, x, y);
    };

    CanvasPreview.prototype.drawPoint = function(point) {
      var style;
      style = {
        circShadowColor: this.style.circShadowColor,
        circFillColor: this.style.pointFillColor,
        circColor: this.style.pointColor,
        lineWidth: this.style.lineWidth
      };
      return this.drawCirc(point.x, point.y, point.radius, style);
    };

    CanvasPreview.prototype.drawLineFromPoints = function(a, b) {
      var aX, aY, bX, bY;
      aX = a.x * this.scale;
      aY = a.y * this.scale;
      bX = b.x * this.scale;
      bY = b.y * this.scale;
      this.ctx.shadowColor = this.style.shadowColor;
      this.ctx.strokeStyle = this.style.lineColor;
      this.ctx.lineWidth = this.style.lineWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(aX, aY);
      this.ctx.lineTo(bX, bY);
      this.ctx.stroke();
      return this.ctx.closePath();
    };

    CanvasPreview.prototype.loadSiluettes = function() {
      var gender, img, manikin, side, siluette, _i, _len, _ref, _results;
      this.siluettes = {};
      this.manikins = {};
      _ref = ["side", "front"];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        side = _ref[_i];
        _results.push((function() {
          var _j, _len1, _ref1, _results1;
          _ref1 = ["m", "f"];
          _results1 = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            gender = _ref1[_j];
            siluette = "/images/siluette_" + gender + "_" + side + ".png";
            img = new Image();
            img.src = siluette;
            this.siluettes[siluette] = img;
            manikin = "/images/manikin_" + gender + "_" + side + ".png";
            img = new Image();
            img.src = manikin;
            _results1.push(this.manikins[manikin] = img);
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    CanvasPreview.prototype.drawSiluette = function(face, search, side) {
      var gender, img, scale, siluette, x, y;
      gender = search.gender.toLowerCase();
      siluette = "/images/siluette_" + gender + "_" + (side ? 'side' : 'front') + ".png";
      scale = face[3] / 30;
      x = (face[0] - 55 * scale) * this.scale;
      y = (face[1] - 15 * scale) * this.scale;
      img = this.siluettes[siluette];
      if (img != null) {
        return this.ctx.drawImage(img, x, y, img.width * scale * this.scale, img.height * scale * this.scale);
      }
    };

    CanvasPreview.prototype.drawManikin = function(search, side) {
      var gender, img, manikin, x, _ref;
      gender = search.gender.toLowerCase();
      manikin = "/images/manikin_" + gender + "_" + (side ? 'side' : 'front') + ".png";
      img = this.manikins[manikin];
      if (img != null) {
        x = (_ref = this.mirrorCamera) != null ? _ref : {
          20: this.ctx.canvas.width - 20
        };
        return this.ctx.drawImage(img, x, 5, img.width * 0.3, img.height * 0.3);
      }
    };

    CanvasPreview.prototype.plotSkeleton = function(skeleton) {
      var lastPoint, name, point, segment, self, _ref, _results;
      if (!CanvasPreview.conf.drawSkeleton) {
        return;
      }
      this.setStyleSkeleton();
      self = this;
      _ref = skeleton.segments();
      _results = [];
      for (name in _ref) {
        segment = _ref[name];
        lastPoint = null;
        _results.push((function() {
          var _i, _len, _results1;
          _results1 = [];
          for (_i = 0, _len = segment.length; _i < _len; _i++) {
            point = segment[_i];
            if (lastPoint !== null) {
              self.drawLineFromPoints(lastPoint, point);
              self.drawText(name, point.x, point.y - point.radius);
            }
            self.drawPoint(point);
            _results1.push(lastPoint = point);
          }
          return _results1;
        })());
      }
      return _results;
    };

    CanvasPreview.prototype.plotMeasurement = function(measurement) {
      var lastPoint, point, position, pts, self, _i, _j, _len, _len1;
      if (!CanvasPreview.conf.drawMeasurements) {
        return;
      }
      self = this;
      lastPoint = null;
      pts = measurement.points;
      for (_i = 0, _len = pts.length; _i < _len; _i++) {
        point = pts[_i];
        if (lastPoint !== null) {
          self.drawLineFromPoints(lastPoint, point);
        }
        lastPoint = point;
      }
      for (_j = 0, _len1 = pts.length; _j < _len1; _j++) {
        point = pts[_j];
        self.drawPoint(point);
      }
      position = pts[0];
      if (position != null) {
        return self.drawText(measurement.text(), position.x, position.y - position.radius);
      } else {
        return console.error("measure without points? ", measurement, pts);
      }
    };

    CanvasPreview.prototype.setDefaultStyle = function() {
      this.style = {};
      this.style.textColor = '#00a9c1';
      this.style.lineWidth = 2;
      this.style.lineColor = '#ddcf21';
      this.style.pointColor = '#ddcf21';
      this.style.pointFillColor = '#ddcf21';
      this.style.rectColor = '#ddvf21';
      this.style.rectFillColor = '#ddvf21';
      this.style.circColor = '#ddvf21';
      this.style.circFillColor = '#ddvf21';
      this.style.shadowColor = 'rgba(0,0,0,0.75)';
      this.style.circShadowColor = 'rgba(0,0,0,0.25)';
      this.style.shadowBlur = 3;
      this.ctx.fillStyle = this.style.textColor;
      this.ctx.lineWidth = this.style.lineWidth;
      this.ctx.strokeStyle = this.style.lineColor;
      this.ctx.shadowColor = this.style.shadowColor;
      this.ctx.shadowBlur = this.style.shadowBlur;
      this.ctx.textBaseline = "bottom";
      return this.ctx.textAlign = "center";
    };

    CanvasPreview.prototype.setStyleReference = function() {
      this.style.textColor = '#fff';
      this.style.lineWidth = 2;
      this.style.lineColor = '#00a9c1';
      this.style.pointColor = '#00a9c1';
      return this.style.pointFillColor = '#00a9c1';
    };

    CanvasPreview.prototype.setStyleMoving = function() {
      this.style.textColor = '#00a9c1';
      this.style.lineWidth = 2;
      this.style.lineColor = '#00a9c1';
      this.style.pointColor = '#00a9c1';
      return this.style.pointFillColor = '#00a9c1';
    };

    CanvasPreview.prototype.setStyleActive = function() {
      this.style.textColor = '#fff';
      this.style.lineWidth = 2;
      this.style.lineColor = '#fff';
      this.style.pointColor = '#fff';
      return this.style.pointFillColor = '#fff';
    };

    CanvasPreview.prototype.setStyleSkeleton = function() {
      this.style.textColor = '#000';
      this.style.lineWidth = 2;
      this.style.lineColor = '#fff';
      this.style.pointColor = '#fff';
      return this.style.pointFillColor = '#fff';
    };

    CanvasPreview.prototype.thumbnailTo = function(canvas) {
      var ctx, img, scale;
      ctx = canvas.getContext('2d');
      ctx.scale(1, 1);
      scale = canvas.width / this.ctxImage.canvas.width;
      img = new Image();
      img.onload = function() {
        ctx.scale(scale, scale);
        return ctx.drawImage(img, 0, 0);
      };
      return img.src = this.ctxImage.canvas.toDataURL();
    };

    CanvasPreview.prototype.zoom = function(point, scale, size) {
      var auxX, auxY, displaceX, displaceY, half, i, img, imgM, j, k, l, mask, maskM, original, padding, self, x, y, _i, _j, _k, _len, _results;
      if (scale == null) {
        scale = 2;
      }
      if (size == null) {
        size = 200;
      }
      self = this;
      padding = 10;
      x = parseInt(point.x * this.scale);
      y = parseInt(point.y * this.scale);
      displaceX = 0;
      displaceY = 0;
      original = parseInt(size / scale);
      if (x + size > this.ctx.canvas.width) {
        displaceX = -(x + size - this.ctx.canvas.width) - 4 * point.radius;
        if (y > this.ctx.canvas.height / 2) {
          displaceY = -size / 2 - 2 * point.radius - padding;
        } else {
          displaceY = size / 2 + 2 * point.radius + padding;
        }
      } else if (y + size / 2 > this.ctx.canvas.height) {
        displaceY += -(y + size / 2 - this.ctx.canvas.height) - 2 * point.radius + padding;
      }
      half = parseInt(original / 2);
      img = this.ctxImage.getImageData(0, 0, this.ctxImage.canvas.width, this.ctxImage.canvas.height);
      img = this.ctxImage.getImageData(0, 0, this.ctxImage.canvas.width, this.ctxImage.canvas.height);
      imgM = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      mask = [];
      maskM = [];
      for (i = _i = 0; 0 <= original ? _i <= original : _i >= original; i = 0 <= original ? ++_i : --_i) {
        mask[i] = [];
        maskM[i] = [];
        for (j = _j = 0; 0 <= original ? _j <= original : _j >= original; j = 0 <= original ? ++_j : --_j) {
          mask[i][j] = ImageProcessing.getColor(img, x + i - half, y + j - half, this.ctxImage.canvas.width);
          maskM[i][j] = ImageProcessing.getColor(imgM, x + i - half, y + j - half, this.ctx.canvas.width);
        }
      }
      _results = [];
      for (i = _k = 0, _len = mask.length; _k < _len; i = ++_k) {
        k = mask[i];
        _results.push((function() {
          var _l, _len1, _results1;
          _results1 = [];
          for (j = _l = 0, _len1 = k.length; _l < _len1; j = ++_l) {
            l = k[j];
            auxX = x + padding + i * scale + point.radius + displaceX;
            auxY = y + j * scale - size / 2 + displaceY;
            if (maskM[i][j].alpha === 255) {
              self.ctx.fillStyle = "rgb(" + (maskM[i][j].to_s()) + ")";
            } else {
              self.ctx.fillStyle = "rgb(" + (l.to_s()) + ")";
            }
            self.ctx.shadowBlur = 0;
            _results1.push(self.ctx.fillRect(auxX, auxY, scale, scale));
          }
          return _results1;
        })());
      }
      return _results;
    };

    return CanvasPreview;

  })();

}).call(this);

(function() {
  var manShirt, manTshirt, womanShirt;

  this.Wear = (function() {
    function Wear(name, spec, measures) {
      this.name = name;
      this.spec = spec;
      this.measures = measures;
    }

    Wear.prototype.genderString = function() {
      if (this.spec.gender === "M") {
        return "Masculina";
      } else {
        return "Feminina";
      }
    };

    Wear.prototype.status = function() {
      if (!this.distanceFirst || !this.distanceLast) {
        return 'sem model';
      }
      if (this.distanceFirst < 0 && this.distanceLast < 0) {
        return 'apertado';
      } else if (this.distanceFirst > 0 && this.distanceLast < 0) {
        return 'ok';
      } else {
        return 'folgado';
      }
    };

    return Wear;

  })();

  this.Measure = (function() {
    function Measure() {}

    Measure.round = function(part, front, side) {
      var r, s;
      if ((part != null) && (front != null) && (side != null)) {
        if (front[part] == null) {
          console.log("missing front " + part, front);
          return;
        } else if (side[part] == null) {
          console.log("missing side " + part, side);
          return;
        }
      } else {
        console.log("missing part? " + part + ", front? " + front + ", side? " + side);
        return;
      }
      r = front[part].value();
      s = side[part].value();
      return Math.PI * Math.sqrt((r * r + s * s) / 2);
    };

    return Measure;

  })();

  this.Fit = (function() {
    function Fit(models) {
      this.models = models;
    }

    Fit.prototype.match = function(front, side) {
      var match, measure, measureName, measures, model, modelMeasure, part, _i, _len, _ref;
      if ((front == null) || (side == null)) {
        return;
      }
      measures = {};
      for (part in this.models[0].measures) {
        match = /(front|side)[A-Z]/.exec(part);
        if (match) {
          measureName = part.replace(match[1], "").toLowerCase();
          if (match[1] === 'front') {
            measures[part] = front[measureName].value();
          } else {
            measures[part] = side[measureName].value();
          }
        } else {
          measures[part] = Measure.round(part, front, side);
        }
      }
      _ref = this.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        model = _ref[_i];
        model.distance = 0;
        model.distanceReal = 0;
        model.distanceOf = {};
        model.distanceFirst = 0;
        model.distanceLast = 0;
        model.fitRange = 0;
        for (part in measures) {
          measure = measures[part];
          if (measure == null) {
            continue;
          }
          modelMeasure = model.measures[part];
          if (!(modelMeasure instanceof Array)) {
            modelMeasure = [modelMeasure];
          }
          model.distanceFirst += modelMeasure[0] - measure;
          if (modelMeasure.lengh > 1) {
            model.distanceLast += modelMeasure[1] - measure;
            model.fitRange += Math.abs(modelMeasure[1] - modelMeasure[0]);
          } else {
            model.fitRange += 3;
          }
          model.distanceOf[part] = model.distanceFirst + model.distanceLast;
          model.distance += Math.abs(model.distanceOf[part]);
          model.distanceReal += model.distanceOf[part];
        }
        model.description = this.descriptionFor(model);
        model.color = this.color(model.distance);
      }
      return this.models.sort(function(a, b) {
        return a.distance - b.distance;
      });
    };

    Fit.prototype.color = function(distance) {
      var b, g, r, val, _ref;
      val = 0.35 - Math.abs(distance) / 50;
      if (val < 0) {
        val = 0;
      }
      if (val > 1) {
        val = 1;
      }
      _ref = ImageProcessing.convertHSVtoRGB(val, 1, 1), r = _ref.r, g = _ref.g, b = _ref.b;
      return "rgb(" + r + ", " + g + ", " + b + ")";
    };

    Fit.prototype.descriptionFor = function(model, front, side) {
      if (model.distanceReal < -model.fitRange) {
        return "apertada";
      } else if (model.distanceReal > model.fitRange) {
        return "frouxa";
      } else {
        return "serve";
      }
    };

    return Fit;

  })();

  this.WearRule = (function() {
    function WearRule(container, element) {
      this.container = container != null ? container : $("#rule-container")[0];
      this.element = element != null ? element : $("#rule-current-value")[0];
      this.zero = 42;
      this.percent = 0;
      this.margin = 5;
      this.maxSize = 280;
    }

    WearRule.prototype.updateRule = function(percent) {
      this.percent = percent;
      return this.element.style.left = "" + (this.zero + parseInt(this.percent * this.maxSize / 100)) + "px";
    };

    return WearRule;

  })();

  manShirt = function(width, height, bust) {
    return new Wear("Camisa", {
      gender: 'M',
      type: 'shirt',
      size: {
        br: width
      }
    }, {
      frontTrunk: height,
      bust: bust
    });
  };

  manTshirt = function(manikin, size, sizeOf) {
    manikin = {
      br: manikin,
      eua: "" + (sizeOf.bust[0] / 2) + "-" + (sizeOf.bust[1] / 2)
    };
    return new Wear("Camiseta / Blusa", {
      gender: 'M',
      type: 'tshirt',
      manikin: manikin,
      size: {
        br: size[0],
        en: size[1]
      }
    }, sizeOf);
  };

  womanShirt = function(manikin, size, sizeOf) {
    manikin = {
      br: manikin,
      eua: manikin
    };
    return new Wear("Blusas e malhas", {
      gender: 'F',
      type: 'shirt',
      manikin: manikin,
      size: {
        br: size[0],
        en: size[1]
      }
    }, sizeOf);
  };

  window.wear = {
    kanui: {
      'M': {
        shirt: new Fit([manShirt(1, ["P", "XD"], [165, 175], [88, 94]), manShirt(2, ["M1", "S"], [170, 180], [94, 100]), manShirt(3, ["M2", "M"], [170, 180], [100, 106]), manShirt(4, ["M3", "L"], [170, 180], [106, 112]), manShirt(5, ["G", "XL"], [175, 190], [108, 114]), manShirt(6, ["GG", "XXL"], [175, 190], [112, 118])]),
        tshirt: new Fit([
          manTshirt(1, ["PP", "XD"], {
            bust: [80, 84],
            frontShoulders: 40
          }), manTshirt(2, ["P", "S"], {
            bust: [88, 92],
            frontShoulders: 42
          }), manTshirt(3, ["M", "M"], {
            bust: [96, 100],
            frontShoulders: 44
          }), manTshirt(4, ["G", "L"], {
            bust: [104, 108],
            frontShoulders: 48
          }), manTshirt(5, ["GG", "XL"], {
            bust: [112, 116],
            frontShoulders: 50
          }), manTshirt(6, ["EG", "XXL"], {
            bust: [120, 124],
            frontShoulders: 52
          })
        ])
      },
      'F': {
        shirt: new Fit([
          womanShirt("34", ["PP", "XD"], {
            frontShoulders: [30, 34],
            waist: [56, 60],
            hips: [83, 90],
            bust: [73, 80]
          }), womanShirt("36-38", ["P", "S"], {
            frontShoulders: [35, 36],
            waist: [64, 68],
            hips: [90, 97],
            bust: [80, 87]
          }), womanShirt("40-42", ["M", "M"], {
            frontShoulders: [37, 38],
            waist: [72, 76],
            hips: [98, 105],
            bust: [88, 96]
          }), womanShirt("44-46", ["G", "L"], {
            frontShoulders: [44, 46],
            waist: [80, 84],
            hips: [106, 115],
            bust: [97, 104]
          }), womanShirt("48-50", ["GG", "XL"], {
            frontShoulders: [48, 50],
            waist: [88, 89],
            hips: [115, 118],
            bust: [105, 115]
          })
        ])
      }
    }
  };

}).call(this);

(function() {
  var Scale;

  this.Point = (function() {
    function Point(x, y, radius, measurement) {
      this.x = x;
      this.y = y;
      this.radius = radius != null ? radius : 0;
      this.measurement = measurement;
    }

    Point.prototype.isOver = function(x, y, scale) {
      var distance;
      if (scale == null) {
        scale = 1;
      }
      x /= scale;
      y /= scale;
      distance = Math.pow(this.radius, 2);
      if (distance < 10) {
        distance = 10;
      }
      return Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2) < distance;
    };

    Point.prototype.updateCenter = function(square) {
      this.x = square.x + square.width / 2;
      return this.y = square.y + square.height / 2;
    };

    Point.prototype.updateXY = function(x, y, scale) {
      this.x = x;
      this.y = y;
      if (scale == null) {
        scale = 1;
      }
      this.x /= scale;
      return this.y /= scale;
    };

    Point.prototype.updateMeasurement = function() {
      var _ref;
      return (_ref = this.measurement) != null ? _ref.pointChanged(this) : void 0;
    };

    Point.prototype.bindMeasurement = function(measurement) {
      this.measurement = measurement;
      return this;
    };

    return Point;

  })();

  Scale = (function() {
    function Scale(scale, unity) {
      this.scale = scale != null ? scale : 1;
      this.unity = unity != null ? unity : 'px';
    }

    Scale.prototype.change = function(scale, unity) {
      this.scale = scale;
      this.unity = unity;
    };

    return Scale;

  })();

  this.Measurement = (function() {
    function Measurement(name, scale, points, perpendicular) {
      var point, _i, _len, _ref;
      this.name = name;
      this.scale = scale;
      this.perpendicular = perpendicular != null ? perpendicular : true;
      if (t.measures[this.name] != null) {
        _ref = t.measures[this.name], this.label = _ref.label, this.description = _ref.description;
      } else {
        console.error("couldn't find locale for measures." + this.name);
      }
      this.points = [];
      for (_i = 0, _len = points.length; _i < _len; _i++) {
        point = points[_i];
        this.points.push(new Point(point.x, point.y, 0, this));
      }
    }

    Measurement.prototype.text = function() {
      var _ref, _ref1;
      if (this.scale && this.scale.scale > 0) {
        return "" + this.label + ": " + (this.value((_ref = this.scale) != null ? _ref.scale : void 0)) + ((_ref1 = this.scale) != null ? _ref1.unity : void 0);
      } else {
        return this.label;
      }
    };

    Measurement.prototype.value = function(scale) {
      if (scale == null) {
        scale = this.scale.scale;
      }
      if (scale !== 1 && (this.realMeasurement != null)) {
        return this.realMeasurement;
      } else {
        return this.points.reduce(function(a, b) {
          return ~~(100 * scale * Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))) / 100.0;
        });
      }
    };

    Measurement.prototype.bindBone = function(startBone, endBone) {
      var dX, dY, x1, y1;
      this.startBone = startBone;
      this.endBone = endBone;
      dY = this.endBone.y - this.startBone.y;
      dX = this.endBone.x - this.startBone.x;
      if (dX === 0) {
        dX = 0.1;
      }
      this.boneAngle = Math.atan2(dY, dX);
      this.m = dY / dX;
      y1 = this.startBone.y;
      x1 = this.startBone.x;
      this.aBone = this.m;
      this.bBone = -this.m * x1 + y1;
      return this;
    };

    Measurement.prototype.boneFunction = function(x) {
      return this.aBone * x - this.bBone;
    };

    Measurement.prototype.otherPoint = function(point) {
      if (this.points[0] === point) {
        return this.points[1];
      } else {
        return this.points[0];
      }
    };

    Measurement.prototype.pointChanged = function(point) {
      var aPer, auxAlpha, bPer, bPer2, dX, dY, m, otherPoint, xInter, xInter2, xNew, yInter, yInter2, yNew;
      if (this.perpendicular) {
        if (this.boneAngle) {
          auxAlpha = this.boneAngle - Math.PI / 2;
        } else {
          auxAlpha = 0;
        }
        m = Math.tan(auxAlpha);
        aPer = m;
        bPer = -m * point.x + point.y;
        xInter = (this.bBone - bPer) / (aPer - this.aBone);
        yInter = this.boneFunction(xInter);
        this.fx = function(x) {
          return aPer * x + bPer;
        };
        this.fy = function(y) {
          return (y - bPer) / aPer;
        };
        this.iterateX = aPer <= 1;
        otherPoint = this.otherPoint(point);
        bPer2 = -m * otherPoint.x + otherPoint.y;
        xInter2 = (this.bBone - bPer2) / (aPer - this.aBone);
        yInter2 = this.boneFunction(xInter2);
        dY = yInter2 - yInter;
        dX = xInter2 - xInter;
        xNew = otherPoint.x - dX;
        yNew = otherPoint.y - dY;
        otherPoint.x = xNew;
        return otherPoint.y = yNew;
      }
    };

    Measurement.prototype.compute = function(skeleton, map, limits, min) {
      var diff, end, f, getXY, j, k, middle, next, point, prev, start, toEnd, type, v, validateMin, x, y, _i, _len, _ref, _ref1, _ref2;
      this.pointChanged(this.points[0]);
      middle = {
        x: (this.points[0].x + this.points[1].x) / 2,
        y: (this.points[0].y + this.points[1].y) / 2
      };
      if (isNaN(middle.x) || isNaN(middle.y)) {
        console.log("NaN", this.label, this);
        return;
      }
      _ref = this.points;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        point = _ref[_i];
        x = point.x;
        if (this.iterateX) {
          type = "x";
          f = this.fx;
          getXY = function(k, j) {
            return [k, j];
          };
        } else {
          type = "y";
          f = this.fy;
          getXY = function(k, j) {
            return [j, k];
          };
        }
        start = (middle[type] + point[type]) / 2;
        diff = Math.abs(point[type] - middle[type]);
        toEnd = function(a, b) {
          return a + b;
        };
        next = function(a) {
          return a + 1;
        };
        prev = function(a) {
          return a - 1;
        };
        validateMin = function(a) {
          return a < start;
        };
        if (min != null) {
          start = Math.max(start, min[1] || 0);
        }
        if (point[type] < middle[type]) {
          if (min != null) {
            start = Math.min(start, min[0] || 10000);
          }
          toEnd = function(a, b) {
            return a - b;
          };
          next = function(a) {
            return a - 1;
          };
          prev = function(a) {
            return a + 1;
          };
          validateMin = function(a) {
            return a > start;
          };
        }
        end = parseInt(toEnd(point[type], diff));
        k = parseInt(start);
        while (k !== end) {
          j = parseInt(f(x));
          _ref1 = getXY(k, j), x = _ref1[0], y = _ref1[1];
          v = ImageProcessing.getImageValue(map, x, y);
          if (v === 0) {
            break;
          }
          k = next(k);
        }
        while (k !== parseInt(middle[type]) && validateMin(k)) {
          j = parseInt(f(x));
          _ref2 = getXY(k, j), x = _ref2[0], y = _ref2[1];
          v = ImageProcessing.getImageValue(map, x, y);
          if (v > 0) {
            break;
          }
          k = prev(k);
        }
        point.x = toEnd(x, -0.5);
        point.y = f(x);
      }
      return this;
    };

    return Measurement;

  })();

  this.Measurements = (function() {
    function Measurements(ctx, w, h, side) {
      this.ctx = ctx;
      this.w = w;
      this.h = h;
      this.side = side;
      this.currentScale = new Scale(1, 'px');
      this.reference = new Measurement("reference", this.currentScale, [
        {
          x: 50,
          y: 120
        }, {
          x: 50,
          y: 180
        }
      ], false);
    }

    Measurements.prototype.showMeasureHelp = function() {
      return UI.showMeasureDescription(t.measures[this.selectedMeasurement].description);
    };

    Measurements.prototype.hideMeasureHelp = function() {
      return UI.showMeasureDescription("");
    };

    Measurements.prototype.trunk = function(map) {
      var skeleton, x;
      skeleton = this.humanBody.skeleton;
      x = skeleton.neck.x - this.humanBody.head.width / 2;
      return new Measurement("trunk", this.currentScale, [
        {
          x: x,
          y: skeleton.neck.y
        }, {
          x: x,
          y: skeleton.hips.y
        }
      ], false);
    };

    Measurements.prototype.widthLimits = function(map) {
      var i, k, l, max, x, x0, x1, y0, y1, _i, _ref, _ref1;
      max = 0;
      x0 = 0;
      x1 = 0;
      y0 = 0;
      y1 = 0;
      l = 0;
      k = 0;
      for (i = _i = 0, _ref = this.h / 2; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        l = i * this.w;
        x = 0;
        while (map.data[l + x] === 0 && x < this.w) {
          x++;
        }
        k = x;
        while (map.data[l + k] !== 0 && k < this.w) {
          k++;
        }
        if (k - x > max) {
          max = k - x;
          _ref1 = [x, k, i], x0 = _ref1[0], x1 = _ref1[1], y0 = _ref1[2];
        }
      }
      if (x0 > 0 && x1 > 0 && y0 > 0) {
        return new Measurement("width", this.currentScale, [
          {
            x: x0,
            y: y0
          }, {
            x: x1,
            y: y0
          }
        ], false);
      }
    };

    Measurements.prototype.humanHips = function(map) {
      return new Measurement("hips", this.currentScale, [
        {
          x: this.skeleton.hips.x - this.skeleton.head.width,
          y: this.skeleton.hips.y
        }, {
          x: this.skeleton.hips.x + this.skeleton.head.width,
          y: this.skeleton.hips.y
        }
      ], true).bindBone(this.skeleton.waist, this.skeleton.hips).compute(this.skeleton, map);
    };

    Measurements.prototype.humanWaist = function(map) {
      return new Measurement("waist", this.currentScale, [
        {
          x: this.skeleton.waist.x - this.skeleton.head.width,
          y: this.skeleton.waist.y
        }, {
          x: this.skeleton.waist.x + this.skeleton.head.width,
          y: this.skeleton.waist.y
        }
      ]).bindBone(this.skeleton.chestCenter, this.skeleton.hips).compute(this.skeleton, map, this.humanBody.waistLimits());
    };

    Measurements.prototype.humanBust = function(map) {
      var headCenter;
      headCenter = new Point(this.skeleton.head.x + this.skeleton.head.width / 2, this.skeleton.head.y);
      return new Measurement("bust", this.currentScale, [
        {
          x: this.skeleton.chestCenter.x - this.skeleton.head.width,
          y: this.skeleton.chestCenter.y
        }, {
          x: this.skeleton.chestCenter.x + this.skeleton.head.width,
          y: this.skeleton.chestCenter.y
        }
      ]).bindBone(headCenter, this.skeleton.waist).compute(this.skeleton, map);
    };

    Measurements.prototype.humanRightWrist = function(map) {
      var angle, arm, auxX, auxY, hand, size;
      arm = this.skeleton.armRight;
      hand = this.skeleton.handRight;
      angle = Math.atan2(hand.y - arm.y, hand.x - arm.x);
      size = this.skeleton.head.width / 4;
      auxX = Math.sin(angle) * size;
      auxY = Math.cos(angle) * size;
      return new Measurement("right_wrist", this.currentScale, [
        {
          x: hand.x - auxX,
          y: hand.y - auxY
        }, {
          x: hand.x + auxX,
          y: hand.y + auxY
        }
      ], true).bindBone(arm, hand).compute(this.skeleton, map);
    };

    Measurements.prototype.humanShoulders = function(map) {
      var headCenter;
      headCenter = new Point(this.skeleton.head.x + this.skeleton.head.width / 2, this.skeleton.head.y);
      return new Measurement("shoulders", this.currentScale, [
        {
          x: this.skeleton.shoulderLeft.x,
          y: this.skeleton.shoulderLeft.y - this.skeleton.head.height * 0.5
        }, {
          x: this.skeleton.shoulderRight.x,
          y: this.skeleton.shoulderRight.y - this.skeleton.head.height * 0.5
        }
      ]).bindBone(headCenter, this.skeleton.chestCenter).compute(this.skeleton, map);
    };

    Measurements.prototype.doMeasurements = function(face, map, leftHand, rightHand) {
      this.humanBody = new HumanBody(face, map, leftHand, rightHand);
      this.skeleton = this.humanBody.skeleton;
      this.trunk = this.trunk(map);
      this.waist = this.humanWaist(map);
      this.hips = this.humanHips(map);
      this.bust = this.humanBust(map);
      this.shoulders = this.humanShoulders(map);
      if (!this.side) {
        this.wrist = this.humanRightWrist(map);
      }
      return this.drawMeasurements();
    };

    Measurements.prototype.updateReferenceWithHand = function(handSize) {
      var angle, arm, auxX, auxY, hand, size;
      if (this.skeleton == null) {
        return;
      }
      arm = this.skeleton.armRight;
      hand = this.skeleton.handRight;
      angle = Math.atan2(hand.y - arm.y, hand.x - arm.x);
      size = this.skeleton.head.width / 4;
      auxX = Math.sin(angle) * size;
      auxY = Math.cos(angle) * size;
      this.currentScale.change(handSize, "cm");
      if (isNaN(hand.x - auxX)) {
        return;
      }
      if (parseInt(size) === 0) {
        return;
      }
      this.reference.points = [new Point(Math.min(hand.x - auxX, this.humanBody.map.rows * 0.8), Math.min(hand.y - auxY, this.humanBody.map.rows * 0.8)), new Point(Math.min(hand.x + auxX, this.humanBody.map.rows * 0.9), Math.min(hand.y + auxY, this.humanBody.map.rows * 0.8))];
      this.reference.realMeasurement = handSize;
      return this.currentScale.change(this.reference.realMeasurement / this.reference.value(1), "cm");
    };

    Measurements.prototype.points = function() {
      var measure, point, points, pts, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
      points = [];
      if (CanvasPreview.conf.drawMeasurements) {
        _ref = this.measures();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          measure = _ref[_i];
          if (measure != null) {
            pts = measure.points;
            for (_j = 0, _len1 = pts.length; _j < _len1; _j++) {
              point = pts[_j];
              points.push(point);
            }
          }
        }
      }
      if (CanvasPreview.conf.drawSkeleton) {
        _ref1 = this.skeleton.points;
        for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
          point = _ref1[_k];
          points.push(point);
        }
      }
      return points;
    };

    Measurements.prototype.measures = function() {
      var measure, measures, measuresNeeded, need;
      need = search.measuresNeeded();
      measuresNeeded = this.side ? need.side : need.front;
      measures = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = measuresNeeded.length; _i < _len; _i++) {
          measure = measuresNeeded[_i];
          _results.push(this[measure]);
        }
        return _results;
      }).call(this);
      measures.push(this.reference);
      return measures;
    };

    Measurements.prototype.drawMeasurements = function() {
      var i, measurement, self, _i, _len, _ref;
      self = this;
      _ref = this.measures();
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        measurement = _ref[i];
        if (measurement != null) {
          if (measurement.name === this.selectedMeasurement) {
            canvasPreview.setStyleActive();
          } else if (measurement === this.reference) {
            canvasPreview.setStyleReference();
          } else {
            canvasPreview.setDefaultStyle();
          }
          canvasPreview.plotMeasurement(measurement);
        }
      }
      return this.drawSkeleton();
    };

    Measurements.prototype.drawHelpMeasurements = function() {
      var img, self;
      self = this;
      img = new Image();
      img.onload = function() {
        var ctx, i, measurement, _i, _len, _ref, _results;
        ctx = self.helpCanvasPreview.ctx;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(img, 0, 0);
        _ref = self.helpMeasurements;
        _results = [];
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          measurement = _ref[i];
          if (measurement != null) {
            if (measurement.name === self.selectedMeasurement) {
              self.helpCanvasPreview.setStyleActive();
            } else {
              self.helpCanvasPreview.setDefaultStyle();
            }
            _results.push(self.helpCanvasPreview.plotMeasurement(measurement));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
      return img.src = this.helpImage;
    };

    Measurements.prototype.drawSkeleton = function() {
      return canvasPreview.plotSkeleton(this.skeleton);
    };

    Measurements.prototype.helpPointsFor = {
      m: {
        front: {
          shoulders: [
            {
              x: 39,
              y: 62
            }, {
              x: 103,
              y: 62
            }
          ],
          bust: [
            {
              x: 52,
              y: 86
            }, {
              x: 93,
              y: 86
            }
          ],
          waist: [
            {
              x: 10,
              y: 70
            }, {
              x: 50,
              y: 70
            }
          ],
          hips: [
            {
              x: 10,
              y: 90
            }, {
              x: 50,
              y: 90
            }
          ],
          right_wrist: [
            {
              x: 60,
              y: 90
            }, {
              x: 65,
              y: 85
            }
          ],
          trunk: [
            {
              x: 40,
              y: 45
            }, {
              x: 40,
              y: 90
            }
          ]
        },
        side: {
          bust: [
            {
              x: 44,
              y: 70
            }, {
              x: 92,
              y: 70
            }
          ],
          waist: [
            {
              x: 60,
              y: 80
            }, {
              x: 110,
              y: 80
            }
          ],
          hips: [
            {
              x: 48,
              y: 124
            }, {
              x: 88,
              y: 124
            }
          ]
        }
      },
      f: {
        front: {
          shoulders: [
            {
              x: 39,
              y: 56
            }, {
              x: 103,
              y: 56
            }
          ],
          bust: [
            {
              x: 48,
              y: 86
            }, {
              x: 93,
              y: 86
            }
          ],
          waist: [
            {
              x: 50,
              y: 113
            }, {
              x: 92,
              y: 113
            }
          ],
          hips: [
            {
              x: 39,
              y: 140
            }, {
              x: 100,
              y: 140
            }
          ],
          right_wrist: [
            {
              x: 60,
              y: 90
            }, {
              x: 65,
              y: 85
            }
          ],
          trunk: [
            {
              x: 48,
              y: 56
            }, {
              x: 48,
              y: 113
            }
          ]
        },
        side: {
          bust: [
            {
              x: 50,
              y: 78
            }, {
              x: 93,
              y: 78
            }
          ],
          waist: [
            {
              x: 58,
              y: 110
            }, {
              x: 90,
              y: 110
            }
          ],
          hips: [
            {
              x: 48,
              y: 134
            }, {
              x: 88,
              y: 134
            }
          ]
        }
      }
    };

    Measurements.prototype.help = function(canvas, canvasHelp) {
      var ctx, gender, helpMeasure, lookAt, measure, measureName, need, points, _i, _j, _len, _len1, _ref, _ref1;
      need = search.measuresNeeded();
      gender = search.gender.toLowerCase();
      lookAt = this.helpPointsFor[gender];
      if (this.side) {
        points = lookAt.side;
        this.helpMeasurements = (function() {
          var _i, _len, _ref, _results;
          _ref = need.side;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            measureName = _ref[_i];
            _results.push(new Measurement(measureName, null, points[measureName]));
          }
          return _results;
        })();
      } else {
        points = lookAt.front;
        this.helpMeasurements = (function() {
          var _i, _len, _ref, _results;
          _ref = need.front;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            measureName = _ref[_i];
            _results.push(new Measurement(measureName, null, points[measureName]));
          }
          return _results;
        })();
      }
      this.helpImage = "/images/manikin_" + gender + "_" + (this.side ? 'side' : 'front') + ".png";
      _ref = this.measures();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        measure = _ref[_i];
        _ref1 = this.helpMeasurements;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          helpMeasure = _ref1[_j];
          if (measure && measure.name && helpMeasure && helpMeasure.name) {
            measure.help = helpMeasure;
            helpMeasure.help = measure;
            measure.canvas = canvas;
            helpMeasure.canvas = canvasHelp;
          }
        }
      }
      ctx = canvasHelp.getContext("2d");
      return this.helpCanvasPreview = new CanvasPreview(ctx);
    };

    return Measurements;

  })();

}).call(this);

(function() {
  this.DetectCameraStep = (function() {
    function DetectCameraStep(wizard, segmentation, navigator, video, modal) {
      this.wizard = wizard;
      this.segmentation = segmentation;
      this.navigator = navigator;
      this.video = video;
      this.modal = modal;
      this.hasCamera = this.navigator.getUserMedia != null;
      this.userAllowToUserCamera = false;
      this.help = {
        title: "Detecção da câmera",
        content: "<p>\n  Vamos lhe ajudar a tirar suas medidas e precisamos da sua câmera.\n</p>\n<p>\n  O aspect irá lhe enviar um pedido de uso da câmera. Se você já bloqueiou alguma vez a câmera do aspect, por favor confira as permissões do seu browser.\n</p>\n<h4>Problemas</h4>\n<p>\n  Se você está vendo a tela da câmera preta ou branca, quem saiba você está com a câmera bloqueada por outro software. Observe se não tem outro aplicativo utilizando a câmera.\n</p>"
      };
    }

    DetectCameraStep.prototype.perform = function() {
      var onError, onFail, onSuccess, self;
      self = this;
      onError = function(error) {
        var btnReload;
        $("#modal-camera-detect").find(".modal-content h2").text("Falha no acesso da câmera");
        $("#modal-camera-detect").find(".modal-content p").text("Desculpe. Falha no acesso da câmera. Desta maneira não podemos tirar suas medidas. Clique no botão abaixo para reiniciar.");
        $("#camera-icon").attr("src", "/images/no-cam.png");
        btnReload = $("<input type='button' class='btn btn-aspect' value='Reiniciar' />");
        btnReload.on("click", function() {
          return window.location.reload();
        });
        return $("#modal-camera-detect").find(".modal-content p").append(btnReload);
      };
      onSuccess = function(stream) {
        var goNextStep, url;
        self.userAllowToUserCamera = true;
        url = window.URL || window.webkitURL;
        self.video.src = url.createObjectURL(stream);
        $("#modal-camera-detect").find(".modal-content h2").text("Obrigado!");
        $("#modal-camera-detect").find(".modal-content p").text("Iniciando o processo...");
        $("#camera-icon").attr("src", "/images/love-cam.png");
        goNextStep = function(i) {
          if (this.segmentation.getCameraImage().data[3] === 0) {
            if (i > 10) {
              return onError();
            } else {
              return setTimeout(goNextStep, 500, i + 1);
            }
          } else {
            this.segmentation.clearCanvas();
            return self.wizard.next();
          }
        };
        return setTimeout(goNextStep, 500, 0);
      };
      onFail = function(error) {
        var btnRedo;
        $("#modal-camera-detect").find(".modal-content h2").text("Você bloqueou o acesso a câmera");
        $("#modal-camera-detect").find(".modal-content p").text("Desta maneira não podemos tirar suas medidas. Desbloqueie a câmera para continuar.");
        $("#camera-icon").attr("src", "/images/no-cam.png");
        btnRedo = $("<input type='button' class='btn btn-aspect' value='Tentar Novamente' />");
        btnRedo.on("click", function() {
          return wizard.redo();
        });
        return $("#modal-camera-detect").find(".modal-content p").append(btnRedo);
      };
      if (this.hasCamera) {
        return this.navigator.getUserMedia({
          video: true,
          audio: false
        }, onSuccess, onFail);
      } else {
        return $("#camera-icon").attr("src", "/images/no-cam.png");
      }
    };

    return DetectCameraStep;

  })();

}).call(this);

(function() {
  this.CreditCardMeasureStep = (function() {
    function CreditCardMeasureStep(wizard, modal) {
      this.wizard = wizard;
      this.modal = modal;
      this.creditCardResizer = new Resizer('#credit_card', this.onResizeCreditCard.bind(this));
      this.creditCardResizer.realSize = 8.5;
      this.creditCardRatio = parseFloat(App.readCookie("creditCardRatio"));
      if ((this.creditCardRatio != null) && isNaN(this.creditCardRatio)) {
        delete this.creditCardRatio;
      }
      this.help = {
        title: "Medida do cartão de créditos",
        content: "<p>\n  No próximo passo iremos medir sua mão na tela do computador.\n  Para isso precisamos de uma medida de um objeto conhecido.\n</p>\n<p>\nPosicione seu cartão no canto esquerdo superior da imagem do cartão de referência e usa o botão de rolagem do mouse para ajustar o tamanho do cartão real com o tamanho de sua tela.\n</p>\n<h4>Por que precisamos disso?</h4>\n<p>\n  Para projetarmos a medida corretamente na tela, precisamos criar uma correlação com a densidade de pixels da sua tela.\n</p>\n<h3>Problemas</h3>\n<h4>Meu cartão não coicide em largura e altura ao mesmo tempo?</h3>\n<p>Possívelmente, a resolução do seu computador está incompatível com o formato da tela, achatando ou esticando a visão. Para continuar, confira e ajuste a resolução do seu monitor para uma resolução adequada.</p>\n<hr />\n<h4>Não tenho um cartão para medir e agora?</h4>\n<p>Você pode usar outro objeto de referência segurando o objeto nas fotos. Clique <a href=\"#\" id=\"do-not-use-hand-measure\" >aqui</a> se quiser seguir sem o cartão. </p>"
      };
    }

    CreditCardMeasureStep.prototype.onResizeCreditCard = function() {
      this.creditCardRatio = this.creditCardResizer.realSize / this.creditCardResizer.scale / this.creditCardResizer.width;
      return App.setCookie("creditCardRatio", this.creditCardRatio);
    };

    CreditCardMeasureStep.prototype.perform = function() {
      if (this.creditCardRatio == null) {
        this.onResizeCreditCard();
      }
      return this.wizard.nextStep();
    };

    CreditCardMeasureStep.prototype.onOpenModal = function() {
      if (this.creditCardRatio == null) {
        return;
      }
      return this.wizard.next();
    };

    return CreditCardMeasureStep;

  })();

  this.HandMeasureStep = (function() {
    function HandMeasureStep(wizard, creditCard, modal) {
      var scale;
      this.wizard = wizard;
      this.creditCard = creditCard;
      this.modal = modal;
      this.handResizer = new Resizer('#hand_reference', this.onResizeHand.bind(this));
      scale = App.readCookie('scaleHand') || 1;
      this.handResizer.setScale(parseFloat(scale));
      this.help = {
        title: "Medida da mão",
        content: "<p>\n  No aspect, usamos a mão como referência para facilitar o uso do aplicativo sem nenhuma ferramenta extra.\n</p>\n<p>\n  A parte que o aspect usa é a palma da mão, conforme a tarja amarela lateral a imagem de exemplo.\n</p>\n<h4>Por que precisamos disso?</h4>\n<p>\n  Usamos a proporção da largura da mão para escalar as outras medidas.  Dessa maneira,a mão é uma medida de referência, e serve como base para correlacionar e encontrar o tamanho das outras medidas do corpo.\n</p>\n<h3>Problemas</h3>\n<h4>Minha tela é menor que minha mão?</h3>\n<p>O importante é fazer a medida da largura da mão desconsiderando o polegar. Se mesmo assim sua mão mão não couber na tela, você pode utilisar outro objeto de referência segurando o objeto nas fotos. Clique <a href=\"#\" id=\"do-not-use-hand-measure\" >aqui</a> se quiser seguir sem a medida da mão.</p>\n<hr />\n<h4>Não tenho a mão esquerda?</h3>\n<p>O importante é fazer a medida da largura da palma da mão desconsiderando o polegar. Posicione a mão inversa e apenas redimensione para que a tarja amarela fique do mesmo tamanho.\n<hr />\n<h4>Minha mão não encaixa no exemplo</h3>\n<p>Se seus dedos são maiores ou menores, isso não importa. O importante é fazer a medida da largura da palma da mão desconsiderando o polegar."
      };
    }

    HandMeasureStep.prototype.perform = function() {
      this.onResizeHand();
      return this.wizard.nextStep();
    };

    HandMeasureStep.prototype.onResizeHand = function() {
      this.pixelsHand = this.handResizer.width;
      this.scaleHand = this.handResizer.scale;
      App.setCookie('scaleHand', this.scaleHand);
      return this.computeHandSize();
    };

    HandMeasureStep.prototype.computeHandSize = function() {
      var action, handWithoutThumb, realImageWidth, realSize, size, _i, _len, _ref;
      realImageWidth = 1446;
      handWithoutThumb = 604;
      realSize = this.creditCard.creditCardRatio * this.pixelsHand * this.scaleHand * handWithoutThumb / realImageWidth;
      realSize = Math.round(realSize * 100) / 100.0;
      this.handResizer.realSize = realSize;
      _ref = this.wizard.actions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        action = _ref[_i];
        if (!(action instanceof BodyMeasurementStep)) {
          continue;
        }
        size = realSize;
        action.handSize = size;
      }
      return $("#hand-size").text("" + this.handResizer.realSize + "cm");
    };

    HandMeasureStep.prototype.onOpenModal = function() {
      var self;
      self = this;
      $("#back_to_creditcard_step").on('click', function() {
        App.expireCookie('creditCardRatio');
        delete self.creditCard.creditCardRatio;
        return self.wizard.setStep(self.step - 1);
      });
      $("#toggle-hand").on('click', function() {
        return handMeasureStep.handResizer.toggleRotation();
      });
      return this.animateOnStart();
    };

    HandMeasureStep.prototype.animateOnStart = function() {
      var handSize, scaleHand;
      scaleHand = parseFloat(App.readCookie('scaleHand') || 1);
      handSize = screen.height * .8;
      return $("#hand_reference").animate({
        width: "50vh"
      }, "fast", function() {
        return $("#hand_reference").animate({
          width: "25vh"
        }, "slow", function() {
          return $("#hand_reference").animate({
            width: "75vh"
          }, "normal", function() {
            return $("#hand_reference").animate({
              width: handSize + "px"
            }, "slow", function() {
              return handMeasureStep.handResizer.setScale(scaleHand);
            });
          });
        });
      });
    };

    return HandMeasureStep;

  })();

  this.Resizer = (function() {
    function Resizer(element, onResize, bindInstance) {
      this.onResize = onResize;
      this.bindInstance = bindInstance;
      this.element = $(element);
      this.startX = -1;
      this.startY = -1;
      this.scale = 1;
      this.startScale = 1;
      this.rotated = false;
      this.setupElementEvents();
      this.width = this.element.width();
      this.height = this.element.height();
    }

    Resizer.prototype.resize = function(distance, e, direction) {
      var aux_scale, h, size, w;
      w = this.width * this.startScale;
      h = this.height * this.startScale;
      size = Math.sqrt(w * w + h * h);
      aux_scale = this.scale;
      if (direction) {
        aux_scale -= distance / size;
      } else {
        aux_scale += distance / size;
      }
      aux_scale = Math.max(0.25, aux_scale);
      aux_scale = Math.min(2.5, aux_scale);
      this.setScale(aux_scale);
      return this.stopPropagation(e);
    };

    Resizer.prototype.setScale = function(scale) {
      this.scale = scale;
      this.redraw();
      this.width = this.element.width();
      this.height = this.element.height();
      return this.onResize();
    };

    Resizer.prototype.redraw = function() {
      if (this.rotated === true) {
        return this.element.css({
          transform: "scale(" + this.scale + ") rotateY(180deg)",
          'transform-origin': '65% 0'
        });
      } else {
        return this.element.css({
          transform: "scale(" + this.scale + ")",
          'transform-origin': '0 0'
        });
      }
    };

    Resizer.prototype.toggleRotation = function() {
      this.rotated = !this.rotated;
      return this.redraw();
    };

    Resizer.prototype.stopPropagation = function(e) {
      e.stopPropagation();
      return e.preventDefault();
    };

    Resizer.prototype.stopDrag = function(e) {
      this.startX = -1;
      this.startY = -1;
      return this.stopPropagation(e);
    };

    Resizer.prototype.setupElementEvents = function() {
      var self;
      this.element.off();
      self = this;
      this.element.on('mousedown', function(e) {
        self.startX = e.offsetX;
        self.startY = e.offsetY;
        return self.stopPropagation(e);
      });
      this.element.on('mousemove', function(e) {
        if (self.startX === -1) {
          return;
        }
        return self.stopPropagation(e);
      });
      this.element.on('mouseup', this.stopDrag.bind(this));
      this.element.on('mouseout', this.stopDrag.bind(this));
      this.element[0].addEventListener('DOMMouseScroll', this.wheel.bind(this), false);
      return this.element[0].onmousewheel = this.wheel.bind(this);
    };

    Resizer.prototype.distanceFrom = function(e) {
      this.distanceX = (e.offsetX - this.startX) * this.startScale;
      this.distanceY = (e.offsetY - this.startY) * this.startScale;
      return Math.abs(this.distanceX + this.distanceY);
    };

    Resizer.prototype.wheel = function(event) {
      var delta;
      delta = 0;
      if (!event) {
        event = window.event;
      }
      if (event.wheelDelta) {
        delta = event.wheelDelta / 120;
      } else if (event.detail) {
        delta = -event.detail / 3;
      }
      if (delta) {
        this.resize(3 * delta, event);
      }
      if (event.preventDefault) {
        event.preventDefault();
      }
      return event.returnValue = false;
    };

    return Resizer;

  })();

}).call(this);

(function() {
  this.BackgroundTrackerStep = (function() {
    function BackgroundTrackerStep(wizard, segmentation, modal) {
      this.wizard = wizard;
      this.segmentation = segmentation;
      this.modal = modal;
      this.bgCaptures = this.segmentation.bgCaptures;
      this.reset();
      this.help = {
        title: "Reconhecimento do ambiente",
        content: "<p>\n  Para evitar problemas com a luz e ruído do ambiente, o aspect reconhece o fundo do ambiente antes de fazer as medidas.\n</p>\n<p>\n  Capturando as imagens de fundo, o aspect elimina ruídos previamente conhecidos, permitindo reconhecer o corpo da pessoa com maior precisão.\n</p>\n<h4>Problemas</h4>\n<p>\n  Alguns casos comuns em que o aspect não irá reconhecer o ambiente:\n\n  <ul>\n  <li>Existe algum objeto em movimento permanente sobre a câmera?</li>\n  <li>Alguma janela aberta que possa ter uma luminosidade variável?</li>\n  <li>O computador ou a câmera usada está em movimento ou sofre vibrações</li>\n  </ul>\n</p>"
      };
    }

    BackgroundTrackerStep.prototype.reset = function() {
      this.startedAt = new Date();
      this.bgMin = null;
      this.bgMax = null;
      this.trackEnough = false;
      return this.index = 0;
    };

    BackgroundTrackerStep.prototype.perform = function() {
      this.reset();
      this.trackBG();
      this.clearCanvas();
      canvasPreview.mirrorCamera = true;
      return App.resizeScreen();
    };

    BackgroundTrackerStep.prototype.clearCanvas = function() {
      canvasPreview.clear();
      return this.segmentation.clearCanvas();
    };

    BackgroundTrackerStep.prototype.onSuccess = function(diff) {
      this.clearCanvas();
      this.wizard.next();
      return UI.audio('success', 'mp3').play();
    };

    BackgroundTrackerStep.prototype.onFail = function(diff) {
      UI.infoUser("Muito movimento no ambiente!", "danger");
      return this.perform();
    };

    BackgroundTrackerStep.prototype.stop = function() {
      if ((this.timeoutId != null)) {
        return clearTimeout(this.timeoutId);
      }
    };

    BackgroundTrackerStep.prototype.trackBG = function(index) {
      var bgGray, bgPixels, diff, i, self, value, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
      if (index == null) {
        self = this;
        if (this.countdown != null) {
          return;
        }
        UI.infoUser("Permaneça <strong>fora</strong> do campo de visão da câmera.", "danger", 12000);
        this.countdown = new CountdownTimer(5, function() {
          self.timeoutId = setTimeout("backgroundTracker.trackBG(0)", 10);
          return delete self.countdown;
        });
        delete self.countdown.flash;
        this.countdown.perform();
        return;
      }
      UI.progress(index + 1);
      if (index < this.bgCaptures) {
        bgPixels = this.segmentation.getCameraImage(index);
        bgGray = ImageProcessing.grayBlurData(bgPixels, 1);
        if (index === 0) {
          this.bgMin = this.segmentation.getImage();
          this.bgMax = this.segmentation.getImage();
          this.bgGrayMax = ImageProcessing.matrix(bgGray.cols, bgGray.rows);
          this.bgGrayMin = ImageProcessing.matrix(bgGray.cols, bgGray.rows);
          _ref = this.bgGrayMin.data;
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            value = _ref[i];
            this.bgGrayMin.data[i] = 255;
          }
        }
        _ref1 = bgPixels.data;
        for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
          value = _ref1[i];
          if (i % 4 === 3) {
            this.bgMin.data[i] = 255;
            this.bgMax.data[i] = 255;
          } else {
            this.bgMin.data[i] = Math.min(this.bgMin.data[i], value);
            this.bgMax.data[i] = Math.max(this.bgMax.data[i], value);
          }
        }
        _ref2 = bgGray.data;
        for (i = _k = 0, _len2 = _ref2.length; _k < _len2; i = ++_k) {
          value = _ref2[i];
          this.bgGrayMin.data[i] = Math.min(this.bgGrayMin.data[i], value);
          this.bgGrayMax.data[i] = Math.max(this.bgGrayMax.data[i], value);
        }
        return this.timeoutId = setTimeout("backgroundTracker.trackBG(" + (index + 1) + ")", 10);
      } else {
        diff = ImageProcessing.imageDifferenceInPercent(this.bgMin, this.bgMax);
        if (diff > 10) {
          return this.onFail(diff);
        } else {
          $('.frames').empty();
          this.segmentation.publishFrameStep("bgGray min " + index, this.bgGrayMin.data);
          this.segmentation.publishFrameStep("bgGray MAX " + index, this.bgGrayMax.data);
          this.segmentation.feedBackgroundImages([this.bgGrayMin, this.bgGrayMax], [this.bgMin, this.bgMax]);
          return this.onSuccess(diff);
        }
      }
    };

    return BackgroundTrackerStep;

  })();

}).call(this);

(function() {
  this.BodyMeasurementStep = (function() {
    function BodyMeasurementStep(wizard, canvasLarge, segmentation, modal, side) {
      var _ref;
      this.wizard = wizard;
      this.canvasLarge = canvasLarge;
      this.segmentation = segmentation;
      this.modal = modal;
      this.side = side === "side";
      this.canvas = this.segmentation.canvas;
      this.canvasScale = this.canvasLarge.width / this.canvas.width;
      canvasPreview.scale = this.canvasScale;
      this.content = this.segmentation.ctx;
      this.bodyCaptures = 5;
      _ref = this.side ? ['perfil', 'side'] : ['frente', 'front'], this.poseLabel = _ref[0], this.pose = _ref[1];
      this.help = {
        title: "Medidas do corpo de " + this.poseLabel,
        content: "<p>\nEste é um dos principais passos do aspect.\nA extração de medidas precisa de sua ajuda para conferir alguns detalhes das suas medidas.\n</p>\n<h4>Posicionamento da medida de referência</h4>\n<p>\nA medida de referência padrão é a palma da mão.\nSe você usar outro objeto como medida, funciona exatamente da mesma maneira que a mão,\napenas você terá que digitar o valor em centímetros das medidas utilizadas.\n</p>\n<p>\nA utilização da mão é apenas para evitar que você precise de algum objeto externo.\n</p>\n<hr />\n<h4>O software não está reconhecendo meu rosto</h4>\n<p>\nUsamos um padrão de reconhecimento de faces baseado em imagens reais. No entanto dependendo das condições de luz o reconhecimento pode falhar.\n</p>\n<ul>\n <li>Verifique se você não está em baixo de uma luz muito forte</li>\n <li>Verifique se seu rosto não está coberto por sombra ou se está parcialmente fora do campo de visão da câmera.</li>\n</ul>\n<hr />\n<h4>As medidas não batem</h4>\n<ul>\n <li>Verifique o tamanho do cartão</li>\n <li>Re-verifique o tamanho de sua mão ou objeto de referência</li>\n <li>Confirme que você ajustou a medida de referênca sobre a mão ou objeto que você escolheu</li>\n <li>Verifique o plano de seu objeto de referência é o mesmo plano das suas medidas</li>\n <li>Verifique se sua mão ou objeto de referência não estava rotacionado, pois a palma da mão precisa estar de frente para câmera pois a medida de referência é a largura da mão.</li>\n</ul>"
      };
    }

    BodyMeasurementStep.prototype.findHands = function(face) {
      var confidence, fistHands, foundHands, hand, hands, leftHand, openHands, rightHand, _i, _j, _len, _len1, _ref;
      fistHands = this.segmentation.findHandFist(this.canvas);
      openHands = this.segmentation.findHandOpen(this.canvas);
      foundHands = [
        {
          type: 'open',
          rgb: [255, 255, 255],
          finds: openHands
        }, {
          type: 'fist',
          rgb: [0, 0, 255],
          finds: fistHands
        }
      ];
      leftHand = null;
      rightHand = null;
      for (_i = 0, _len = foundHands.length; _i < _len; _i++) {
        hands = foundHands[_i];
        _ref = hands.finds;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          hand = _ref[_j];
          confidence = hand[4];
          if (confidence > 13 && hand[2] < face.height) {
            if (hand[0] < face.x) {
              if (leftHand) {
                continue;
              }
              leftHand = {
                x: hand[0],
                y: hand[1],
                width: hand[2],
                height: hand[3],
                confidence: hand[4],
                type: hands.type,
                side: "left",
                rgb: hands.rgb,
                data: hand
              };
            }
            if (hand[0] > face.x) {
              if (rightHand) {
                continue;
              }
              rightHand = {
                x: hand[0],
                y: hand[1],
                width: hand[2],
                height: hand[3],
                confidence: hand[4],
                type: hands.type,
                side: "right",
                rgb: hands.rgb,
                data: hand
              };
            }
          }
        }
      }
      return [leftHand, rightHand];
    };

    BodyMeasurementStep.prototype.observeSegmentation = function() {
      var allowTakePicture, ctx, delay, face, faceRect, h, image, imageLarge, self, startTime, w, x, y;
      if (this.stopped) {
        return;
      }
      canvasPreview.clear();
      this.segmentation.refreshVideo();
      this.segmentation.refreshVideo(canvasPreview.ctx);
      canvasPreview.drawManikin(search, this.side);
      startTime = new Date().getTime();
      self = this;
      this.face = this.segmentation.findFace();
      if (this.face != null) {
        x = this.face.x;
        y = this.face.y;
        w = this.face.width;
        h = this.face.height;
        faceRect = [x, y, w, h];
        this.previousFace = faceRect;
        if (this.face.height > this.canvas.height / 4) {
          if (this.face.height > this.canvas.height / 3) {
            this.willTakePicture = true;
            clearTimeout(this.waitAllowTakePicture);
            UI.infoUser("Afaste-se da câmera.", "danger");
            canvasPreview.drawRect(faceRect, 'rgba(230,0,0,0.5)');
          } else {
            this.willTakePicture = true;
            clearTimeout(this.waitAllowTakePicture);
            UI.infoUser("Afaste-se um pouco mais.", "danger");
            canvasPreview.drawRect(faceRect, 'rgba(180,180,0,0.5)');
          }
        } else if ((this.face.y + 4 * this.face.height) > this.canvas.height) {
          this.willTakePicture = true;
          clearTimeout(this.waitAllowTakePicture);
          UI.infoUser("Posicione a camera. Cabeça e quadril devem estar visíveis.", "danger");
          canvasPreview.drawRect(faceRect, 'rgba(0,0,0,0.5)');
        } else {
          if (self.willTakePicture) {
            UI.infoUser("Identificamos sua face agora mantenha-se parado de " + this.pose + ".<br/>Aguarde...", "info");
            allowTakePicture = function() {
              return delete self.willTakePicture;
            };
            if (this.images.length === 0) {
              delay = 3000;
              UI.progress(50 / this.bodyCaptures);
              UI.infoUser("Identificamos sua face agora mantenha-se parado de " + this.pose + ".<br/><b>Posicione-se conforme exemplo</b>.", "info");
            } else {
              delay = 200;
            }
            this.waitAllowTakePicture = setTimeout(allowTakePicture, delay);
          } else {
            UI.infoUser("Capturando imagem " + this.pose + " " + (this.images.length + 1) + " de " + this.bodyCaptures + "!");
            if (this.images.length <= this.bodyCaptures) {
              image = this.segmentation.getImage();
              ctx = canvasPreview.ctx;
              imageLarge = this.segmentation.getImage(ctx);
              face = this.face;
              if ((face != null) && (image != null)) {
                this.images.push({
                  image: image,
                  imageLarge: imageLarge,
                  face: face
                });
              }
              UI.progress(100 * this.images.length / this.bodyCaptures);
              this.willTakePicture = true;
            }
            if (this.images.length === this.bodyCaptures) {
              delete this.countdown;
              this.registerCanvas();
              this.stopSegmentation();
              this.segmentation.clearCanvas();
              canvasPreview.clear();
              setTimeout(this.wizard.next.bind(this.wizard), 500);
              UI.audio('success', 'mp3').play();
            }
          }
        }
      }
      UI.performanceReport(new Date().getTime() - startTime);
      if ((this.timeoutID != null)) {
        return this.timeoutID = setTimeout(self.observeSegmentation.bind(self), 40);
      }
    };

    BodyMeasurementStep.prototype.selectCurrentImage = function(currentImage) {
      var _ref;
      this.currentImage = currentImage;
      _ref = this.results[this.currentImage], this.measurements = _ref.measurements, this.imageLarge = _ref.imageLarge;
      this.drawMeasurements();
      return this.startHelpMeasurement();
    };

    BodyMeasurementStep.prototype.thumbnail = function() {
      return canvasPreview.thumbnailTo($("#thumbnail-" + this.pose)[0]);
    };

    BodyMeasurementStep.prototype.proccessImage = function(image, imageLarge, face) {
      var hands, imageData, imageGray, leftHand, map, measurements, rightHand, _ref;
      _ref = this.segmentation.proccess(image), imageData = _ref[0], map = _ref[1], imageGray = _ref[2];
      this.results || (this.results = []);
      if (map) {
        this.segmentation.clearWith(image);
        hands = this.findHands(face);
        leftHand = hands[0], rightHand = hands[1];
        measurements = new Measurements(this.context, this.canvas.width, this.canvas.height, this.side);
        measurements.doMeasurements(face, map, leftHand, rightHand);
        if (this.handSize != null) {
          measurements.updateReferenceWithHand(this.handSize);
        }
        canvasPreview.drawRect(face.data, 'rgba(0,230,0,0.5)');
        this.results.push({
          image: image,
          imageLarge: imageLarge,
          imageData: imageData,
          map: map,
          imageGray: imageGray,
          face: face,
          measurements: measurements
        });
        this.selectCurrentImage(this.results.length - 1);
        return this.thumbnail();
      }
    };

    BodyMeasurementStep.prototype.selectBetterResult = function() {
      var r, _i, _len, _ref, _results;
      _ref = this.results;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        r = _ref[_i];
        _results.push(r);
      }
      return _results;
    };

    BodyMeasurementStep.prototype.registerCanvas = function() {
      var canvas, image;
      image = this.segmentation.getImage();
      canvas = $("<canvas></canvas>").get(0);
      canvas["class"] = "pose-" + this.pose;
      canvas.info = {
        step: this
      };
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.getContext("2d").putImageData(image, 0, 0);
      return $("#gallery").append(canvas);
    };

    BodyMeasurementStep.prototype.startSegmentation = function() {
      var self, verifyCapturing;
      this.startedAt = new Date();
      if ((this.timeoutID != null)) {
        this.stopSegmentation();
      }
      delete this.stopped;
      self = this;
      UI.infoUser("Posicione-se de " + this.poseLabel + " para a câmera (aprox. 2,5 m. de distância) .", "info", 8000);
      this.willTakePicture = true;
      this.timeoutID = setTimeout(self.observeSegmentation.bind(self), 40);
      verifyCapturing = function(previous) {
        if (this.timeoutID != null) {
          if (previous === self.images.length) {
            UI.infoUser("Não conseguimos identificar seu rosto :(");
          }
          return setTimeout(verifyCapturing, 5000, self.images.length);
        }
      };
      return setTimeout(verifyCapturing, self.images.length, 10000);
    };

    BodyMeasurementStep.prototype.stopSegmentation = function() {
      this.stopped = true;
      clearTimeout(this.timeoutID);
      return delete this.timeoutID;
    };

    BodyMeasurementStep.prototype.startHelpMeasurement = function() {
      var canvasHelp, self;
      canvasHelp = $("#help_measurements");
      self = this;
      this.measurements.help(this.canvasLarge, canvasHelp[0]);
      canvasHelp[0].getContext('2d').clearRect(0, 0, canvasHelp.width(), canvasHelp.height());
      return canvasHelp.on("mousemove", function(e) {
        var measurement, point, _i, _j, _len, _len1, _ref, _ref1;
        if (!self.stopped) {
          return;
        }
        self.measurements.selectedMeasurement = "";
        _ref = self.measurements.helpMeasurements;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          measurement = _ref[_i];
          _ref1 = measurement.points;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            point = _ref1[_j];
            if (point.isOver(self.mouseX(e), self.mouseY(e))) {
              self.measurements.selectedMeasurement = measurement.name;
            }
          }
        }
        if (self.measurements.selectedMeasurement !== "") {
          $(canvasHelp).addClass("selecting");
          self.measurements.showMeasureHelp();
        } else {
          self.measurements.hideMeasureHelp();
          $(canvasHelp).removeClass("selecting");
        }
        return self.drawMeasurements();
      });
    };

    BodyMeasurementStep.prototype.allowDragPoints = function() {
      var _canvas;
      _canvas = $(this.canvasLarge);
      _canvas.off();
      _canvas.on('mousedown', this.startDragging.bind(this));
      _canvas.on('mousemove', this.drag.bind(this));
      _canvas.on('mouseup', this.stopDragging.bind(this));
      return _canvas.on('mouseout', this.stopDragging.bind(this));
    };

    BodyMeasurementStep.prototype.mouseX = function(e) {
      return e.offsetX;
    };

    BodyMeasurementStep.prototype.mouseY = function(e) {
      return e.offsetY;
    };

    BodyMeasurementStep.prototype.startDragging = function(e) {
      var point, self, _i, _len, _ref;
      self = this;
      _ref = this.measurements.points();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        point = _ref[_i];
        if (point.isOver(this.mouseX(e), this.mouseY(e), this.canvasScale)) {
          canvasPreview.zoom(point);
          return this.selectedPoint = point;
        }
      }
    };

    BodyMeasurementStep.prototype.drag = function(e) {
      var measurement, point, time, time1, _i, _j, _len, _len1, _ref, _ref1;
      if (!this.stopped) {
        return;
      }
      this.activePoint = null;
      this.measurements.selectedMeasurement = "";
      time = new Date().getTime();
      _ref = this.measurements.measures();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        measurement = _ref[_i];
        if (measurement != null) {
          _ref1 = measurement.points;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            point = _ref1[_j];
            if (point.isOver(this.mouseX(e), this.mouseY(e), this.canvasScale)) {
              this.activePoint = point;
              this.measurements.selectedMeasurement = measurement.name;
              break;
            }
          }
        }
      }
      console.log("1", new Date().getTime() - time);
      time = new Date().getTime();
      console.log("2", new Date().getTime() - time);
      time = new Date().getTime();
      if (this.selectedPoint != null) {
        time1 = new Date().getTime();
        this.selectedPoint.updateXY(this.mouseX(e), this.mouseY(e), this.canvasScale);
        this.selectedPoint.updateMeasurement();
        console.log("2.1", new Date().getTime() - time1);
        time1 = new Date().getTime();
        this.drawMeasurements();
        console.log("2.2", new Date().getTime() - time1);
        time1 = new Date().getTime();
        canvasPreview.setStyleMoving();
        console.log("2.3", new Date().getTime() - time1);
        time1 = new Date().getTime();
        canvasPreview.drawPoint(this.selectedPoint);
        console.log("2.4", new Date().getTime() - time1);
        time1 = new Date().getTime();
        canvasPreview.zoom(this.selectedPoint);
        console.log("2.5", new Date().getTime() - time1);
        time1 = new Date().getTime();
        if (this.onAdjustMeasureTimeout) {
          clearTimeout(this.onAdjustMeasureTimeout);
          this.onAdjustMeasureTimeout = void 0;
        }
        this.onAdjustMeasureTimeout = setTimeout(this.onAdjustMeasure.bind(this), 100);
        console.log("2.6", new Date().getTime() - time1);
      } else {
        this.drawMeasurements();
        if (this.activePoint != null) {
          canvasPreview.setStyleActive();
          canvasPreview.drawPoint(this.activePoint);
        }
      }
      console.log("3", new Date().getTime() - time);
      time = new Date().getTime();
      if (this.activePoint != null) {
        $(this.canvas).addClass("moving");
        this.measurements.showMeasureHelp();
      } else {
        $(this.canvas).removeClass("moving");
        this.measurements.hideMeasureHelp();
      }
      console.log("4", new Date().getTime() - time);
      return time = new Date().getTime();
    };

    BodyMeasurementStep.prototype.stopDragging = function(e) {
      var reference, self, setNewScale, started1MinAgo, _base, _ref, _ref1;
      if (!this.stopped) {
        return;
      }
      reference = (_ref = this.measurements) != null ? _ref.reference : void 0;
      self = this;
      if (reference != null) {
        if (reference.realMeasurement == null) {
          if (reference.points.indexOf(this.selectedPoint) >= 0) {
            (_base = this.measurements.reference).dragTimes || (_base.dragTimes = 0);
            this.measurements.reference.dragTimes++;
            if (this.measurements.reference.dragTimes >= 2) {
              delete this.selectedPoint;
              setNewScale = function() {
                var unity, value, _, _ref1;
                _ref1 = $("#new-scale").val().match(/(\d+)\s*(.*)/), _ = _ref1[0], value = _ref1[1], unity = _ref1[2];
                if ((value != null) && (unity != null)) {
                  reference = self.measurements.reference;
                  value = parseFloat(value) / reference.value(1);
                  self.measurements.currentScale.change(value, unity);
                  $("#modal-change-scale").modal('hide');
                  $(".perform-step, .next-step").removeClass("hidden");
                  return self.drawMeasurements();
                }
              };
              $("#modal-change-scale").modal({
                backdrop: 'static',
                keyboard: false
              });
              $("#modal-change-scale input#new-scale").focus();
              $("#modal-change-scale input#new-scale").on('keyup', function(event) {
                if (event.keyCode === 13) {
                  return setNewScale();
                }
              });
              $("#modal-change-scale .btn-success").on("click", setNewScale);
            }
          } else {
            if (((_ref1 = this.measurements.reference) != null ? _ref1.dragTimes : void 0) == null) {
              started1MinAgo = (new Date().getTime() - this.startedAt.getTime()) > 1000 * 60;
              if (started1MinAgo) {
                UI.infoUser("Lembre-se de ajustar a medida de referência!", "warn");
              }
            }
          }
        } else {
          this.measurements.currentScale.change(reference.realMeasurement / reference.value(1), "cm");
        }
      }
      this.drawMeasurements();
      return delete this.selectedPoint;
    };

    BodyMeasurementStep.prototype.drawMeasurements = function() {
      canvasPreview.clearWith(this.imageLarge);
      this.measurements.drawMeasurements();
      return this.measurements.drawHelpMeasurements();
    };

    BodyMeasurementStep.prototype.perform = function() {
      this.images = [];
      this.stopped = false;
      this.startSegmentation();
      $('.video-preview .perform-step, .video-preview .next-step').addClass("hidden");
      canvasPreview.mirrorCamera = true;
      return App.resizeScreen();
    };

    BodyMeasurementStep.prototype.stop = function() {
      return this.stopSegmentation();
    };

    BodyMeasurementStep.prototype.onOpenModal = function() {
      var img;
      if (search.gender !== 'M') {
        img = this.modal.find("img");
        return img.attr('src', img.attr('src').replace('male', 'female'));
      }
    };

    return BodyMeasurementStep;

  })();

}).call(this);

(function() {
  this.AdjustMeasuresStep = (function() {
    function AdjustMeasuresStep(wizard, front, side, modal) {
      var self;
      this.wizard = wizard;
      this.front = front;
      this.side = side;
      this.modal = modal;
      this.steps = {
        front: this.front,
        side: this.side
      };
      self = this;
      this.front.onAdjustMeasure = this.side.onAdjustMeasure = function() {
        self.findBestWearFit();
        self.showMeasuresInTable(this);
        return this.thumbnail();
      };
      this.currentStep = 'front';
      this.help = {
        title: "Medidas do corpo de " + this.poseLabel,
        content: "<p>\nEste é um dos principais passos do aspect.\nA extração de medidas precisa de sua ajuda para conferir alguns detalhes das suas medidas.\n</p>\n<h4>Posicionamento da medida de referência</h4>\n<p>\nA medida de referência padrão é a palma da mão.\nSe você usar outro objeto como medida, funciona exatamente da mesma maneira que a mão,\napenas você terá que digitar o valor em centímetros das medidas utilizadas.\n</p>\n<p>\nA utilização da mão é apenas para evitar que você precise de algum objeto externo.\n</p>\n<hr />\n<h4>O software não está reconhecendo meu rosto</h4>\n<p>\nUsamos um padrão de reconhecimento de faces baseado em imagens reais. No entanto dependendo das condições de luz o reconhecimento pode falhar.\n</p>\n<ul>\n <li>Verifique se você não está em baixo de uma luz muito forte</li>\n <li>Verifique se seu rosto não está coberto por sombra ou se está parcialmente fora do campo de visão da câmera.</li>\n</ul>\n<hr />\n<h4>As medidas não batem</h4>\n<ul>\n <li>Verifique o tamanho do cartão</li>\n <li>Re-verifique o tamanho de sua mão ou objeto de referência</li>\n <li>Confirme que você ajustou a medida de referênca sobre a mão ou objeto que você escolheu</li>\n <li>Verifique o plano de seu objeto de referência é o mesmo plano das suas medidas</li>\n <li>Verifique se sua mão ou objeto de referência não estava rotacionado, pois a palma da mão precisa estar de frente para câmera pois a medida de referência é a largura da mão.</li>\n</ul>"
      };
    }

    AdjustMeasuresStep.prototype.onOpenModal = function() {
      return this.proccessImages();
    };

    AdjustMeasuresStep.prototype.findBestWearFit = function() {
      var col, fits, front, i, model, search, side, _i, _len, _ref;
      _ref = [this.front.measurements, this.side.measurements], front = _ref[0], side = _ref[1];
      search = new Search();
      fits = search.fitsWith(front, side);
      if ((fits == null) || fits.length === 0) {
        return;
      }
      $("#fits").empty();
      for (i = _i = 0, _len = fits.length; _i < _len; i = ++_i) {
        model = fits[i];
        if (i > 2) {
          break;
        }
        col = $("<div class='col-sm-6 col-md-4' style='background: " + model.color + "'><div><span class='big-text'>" + model.spec.size.br + "</span> <span class='fit-label'>" + model.description + "</span></span></div>");
        $("#fits").append(col);
      }
      return $("#fits").removeClass("hidden");
    };

    AdjustMeasuresStep.prototype.showMeasuresInTable = function(step) {
      var measure, table, tr, _i, _len, _ref;
      table = $("<table></table>");
      table.addClass("table-striped");
      tr = $("<tr></tr>");
      tr.append($("<td>Medida</td>"));
      tr.append($("<td>Valor (" + step.measurements.currentScale.unity + ")</td>"));
      table.append(tr);
      _ref = step.measurements.measures();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        measure = _ref[_i];
        if (measure == null) {
          continue;
        }
        tr = $("<tr></tr>");
        tr.append($("<td>" + measure.label + "</td>"));
        tr.append($("<td>" + (measure.value()) + "</td>"));
        table.append(tr);
      }
      return $(".measures-" + (step.measurements.side ? "side" : "front")).html(table);
    };

    AdjustMeasuresStep.prototype.proccessStepImage = function(stepByStep) {
      var canvas, counter, ctx, face, image, imageLarge, name, progress, step, _ref;
      canvasPreview.mirrorCamera = false;
      _ref = stepByStep.pop(), step = _ref.step, image = _ref.image, imageLarge = _ref.imageLarge, face = _ref.face, name = _ref.name, counter = _ref.counter;
      canvas = $("#current-proccessing")[0];
      ctx = canvas.getContext('2d');
      ctx.putImageData(image, 0, 0, 0, 0, canvas.width, canvas.height);
      step.proccessImage(image, imageLarge, face);
      progress = "(" + name + ") " + (parseInt(100 * (counter - stepByStep.length) / counter)) + "%";
      $('#measuring-progress').html("Processando: " + progress);
      UI.infoUser("Aguarde, processando medidas " + progress);
      if (stepByStep.length > 0) {
        return setTimeout(this.proccessStepImage.bind(this), 100, stepByStep);
      } else {
        return setTimeout(this.finish.bind(this), 500);
      }
    };

    AdjustMeasuresStep.prototype.proccessImages = function() {
      var counter, face, image, imageLarge, name, step, stepByStep, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      stepByStep = [];
      counter = 0;
      _ref = this.steps;
      for (name in _ref) {
        step = _ref[name];
        _ref1 = step.images;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          _ref2 = _ref1[_i], image = _ref2.image, face = _ref2.face;
          counter++;
        }
      }
      _ref3 = this.steps;
      for (name in _ref3) {
        step = _ref3[name];
        _ref4 = step.images;
        for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
          _ref5 = _ref4[_j], image = _ref5.image, imageLarge = _ref5.imageLarge, face = _ref5.face;
          stepByStep.push({
            step: step,
            image: image,
            imageLarge: imageLarge,
            face: face,
            name: name,
            counter: counter
          });
        }
      }
      return this.proccessStepImage(stepByStep);
    };

    AdjustMeasuresStep.prototype.finish = function() {
      UI.infoUser("Agora, se necessário arraste as medidas até a posição correta.");
      this.setCurrentStep(this.currentStep);
      this.modal.modal('hide');
      $('#sidemenu').removeClass('hidden');
      return UI.toggleSidemenu('open');
    };

    AdjustMeasuresStep.prototype.setCurrentStep = function(step) {
      var current;
      this.currentStep = step;
      canvasPreview.mirrorCamera = false;
      App.resizeScreen();
      current = this.steps[step];
      current.allowDragPoints();
      current.drawMeasurements();
      return current.startHelpMeasurement();
    };

    return AdjustMeasuresStep;

  })();

}).call(this);

(function() {
  this.VALID_EMAIL = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

  this.PublishInfo = (function() {
    PublishInfo.site = "https://aspect-server.herokuapp.com";

    PublishInfo.path = "measures";

    PublishInfo.upload = function(url, data, success, error) {
      return $.post(url, data, success, "json");
    };

    function PublishInfo(user, measures) {
      this.user = user;
      this.measures = measures;
      console.log("publishing info from: ", this.user, this.measures);
    }

    PublishInfo.prototype.perform = function(onSucess, onError) {
      var data, url;
      url = "" + PublishInfo.site + "/" + PublishInfo.path;
      data = {
        measure: {
          from: this.user,
          set: this.measures
        }
      };
      return PublishInfo.upload(url, data, onSucess, onError);
    };

    return PublishInfo;

  })();

  this.ShowResultsStep = (function() {
    function ShowResultsStep(wizard, front, side, modal) {
      this.wizard = wizard;
      this.front = front;
      this.side = side;
      this.modal = modal;
      this.button = this.modal.find(".btn-success");
      this.email = this.modal.find("#email");
    }

    ShowResultsStep.prototype.perform = function() {
      var up;
      this.modal.modal();
      this.email.focus();
      up = this.uploadData.bind(this);
      this.email.on('keyup', function(event) {
        if (event.keyCode === 13) {
          return up();
        }
      });
      this.button.on("click", up);
      return setTimeout("showResultsStep.setupUI()", 500);
    };

    ShowResultsStep.prototype.setupUI = function() {
      this.drawImagesFromCanvas();
      return this.drawCirclesForMeasures();
    };

    ShowResultsStep.prototype.drawImagesFromCanvas = function() {
      var drawImg, picFront, picSide;
      drawImg = function(pic, where) {
        where.drawMeasurements();
        pic.attr('src', where.canvasLarge.toDataURL());
        return pic.attr('width', 320);
      };
      picFront = this.modal.find(".picture.front");
      picSide = this.modal.find(".picture.side");
      drawImg(picFront, this.front);
      return drawImg(picSide, this.side);
    };

    ShowResultsStep.prototype.drawCirclesForMeasures = function() {
      var circle, circles, measure, _i, _j, _len, _len1, _ref, _ref1, _results;
      circle = function(label, value) {
        var template;
        return template = "<div class=\"measure-circle\">\n  <span class=\"value\">" + value + "</span>\n  <span class=\"label\">" + label + "</span>\n</div>";
      };
      circles = this.modal.find(".measures-panel");
      circles.empty();
      _ref = this.front.measurements.measures();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        measure = _ref[_i];
        if ((measure == null) || measure.name === "reference") {
          continue;
        }
        circles.append(circle(measure.label, measure.value()));
      }
      _ref1 = this.side.measurements.measures();
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        measure = _ref1[_j];
        if (measure == null) {
          continue;
        }
        _results.push(circles.append(circle(measure.label, measure.value())));
      }
      return _results;
    };

    ShowResultsStep.prototype.uploadData = function() {
      var canvas, email, error, footer, front, imageContent, info, m, measure, onError, onSucess, pose, progress, self, side, success, uploadingImg, _i, _len, _ref, _ref1, _ref2;
      self = window.showResultsStep;
      email = self.email.val();
      if (email.length === 0) {
        this.email.attr("placeholder", "Digite seu email!");
        return;
      } else if (!VALID_EMAIL.test(email)) {
        this.email.attr("placeholder", "Digite um email válido :(");
        return;
      }
      self.user = {
        email: email
      };
      _ref = [self.front.measurements, self.side.measurements], front = _ref[0], side = _ref[1];
      _ref1 = (function() {
        var _i, _j, _len, _len1, _ref1, _ref2, _results;
        _ref1 = [front, side];
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          measure = _ref1[_i];
          delete measure.canvasPreview;
          delete measure.ctx;
          delete measure.humanBody;
          delete measure.skeleton;
          info = {};
          _ref2 = measure.measures();
          for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
            m = _ref2[_j];
            if ((m != null) && m.name !== "reference") {
              info[m.name] = m.value();
            }
          }
          _results.push(info);
        }
        return _results;
      })(), front = _ref1[0], side = _ref1[1];
      self.publisher = new PublishInfo(self.user, {
        front: front,
        side: side
      });
      footer = self.modal.find(".modal-footer");
      uploadingImg = new Image();
      footer.append(uploadingImg);
      _ref2 = [self.front, self.side];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        pose = _ref2[_i];
        pose.drawMeasurements();
        canvas = pose.canvasLarge;
        uploadingImg.src = canvas.toDataURL("image/png");
        imageContent = canvas.toDataURL().split(',', 2)[1];
        success = function(blob) {
          var _base;
          console.log("Store successful:", blob);
          canvas.remote_url = blob.url;
          (_base = self.publisher.user).images || (_base.images = []);
          self.publisher.user.images.push(blob.url);
          if (self.publisher.user.images.length === 2) {
            footer.empty();
            return self.publisher.perform(onSucess, onError);
          }
        };
        error = function(err) {
          return console.error("Store error:", err);
        };
        progress = function(percent) {
          return UI.infoUser("Uploading " + percent);
        };
        filepicker.setKey('AN8l6x4Shekrztt8K7Xxwz');
        filepicker.store(imageContent, {
          mimetype: 'image/png',
          base64decode: true
        }, success, error, progress);
      }
      console.log("publisher", self.publisher);
      onSucess = function(data) {
        console.log("publish info sucessfully", data);
        return self.modal.modal('hide');
      };
      return onError = function(data) {
        return console.error("ops!", data);
      };
    };

    return ShowResultsStep;

  })();

}).call(this);

(function() {
  this.Wizard = (function() {
    function Wizard() {
      this.step = 0;
      this.actions = [];
    }

    Wizard.prototype.start = function() {
      return this.perform(1);
    };

    Wizard.prototype.push = function(action) {
      this.actions.push(action);
      return action.step = this.actions.length;
    };

    Wizard.prototype.nextStep = function() {
      var _ref;
      if ((_ref = this.currentAction) != null) {
        if (typeof _ref.stop === "function") {
          _ref.stop();
        }
      }
      if (this.step < this.actions.length) {
        this.step += 1;
      }
      return this.setCurrentAction();
    };

    Wizard.prototype.previousStep = function() {
      var _ref;
      if ((_ref = this.currentAction) != null) {
        if (typeof _ref.stop === "function") {
          _ref.stop();
        }
      }
      if (this.step > 1) {
        this.step -= 1;
      }
      return this.setCurrentAction();
    };

    Wizard.prototype.next = function() {
      return this.nextStep();
    };

    Wizard.prototype.previous = function() {
      return this.previousStep();
    };

    Wizard.prototype.setStep = function(stepNumber) {
      this.step = stepNumber;
      return this.setCurrentAction();
    };

    Wizard.prototype.setCurrentAction = function() {
      var nav, _base;
      if (this.currentAction != null) {
        this.currentAction.modal.modal('hide');
      }
      this.currentAction = this.actions[this.step - 1];
      if (this.step === 1) {
        this.perform(this.step);
      }
      this.currentAction.modal.modal({
        keyboard: false,
        backdrop: 'static'
      });
      if (typeof (_base = this.currentAction).onOpenModal === "function") {
        _base.onOpenModal();
      }
      if (typeof this.onOpenModal === "function") {
        this.onOpenModal();
      }
      nav = this.currentAction.modal.find(".wizard-navigator");
      nav.html(this.stepsUI());
      return this.currentAction;
    };

    Wizard.prototype.stepsUI = function() {
      var button, buttons, gotoStep, i, self, x, _i, _len, _ref;
      buttons = $("<div></div>");
      self = this;
      gotoStep = function() {
        var step;
        step = parseInt($(this).attr('value'));
        return self.setStep(step);
      };
      _ref = this.actions;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        x = _ref[i];
        button = $("<input type='button' class='circle goto-step' value='" + (i + 1) + "' />");
        if (i === this.step - 1) {
          button.addClass("current");
        } else if (i > this.step - 1) {
          button.attr("disabled", "disabled");
        } else {
          button.on("click", gotoStep);
        }
        buttons.append(button);
        if (i < this.actions.length - 1) {
          buttons.append($("<span class='between-steps'></span>"));
        }
      }
      return buttons;
    };

    Wizard.prototype.perform = function(stepNumber) {
      var _base;
      if ((stepNumber != null) && this.step !== stepNumber) {
        this.setStep(stepNumber);
      } else {
        if (this.currentAction.startPerforming != null) {
          if (typeof (_base = this.currentAction).stop === "function") {
            _base.stop();
          }
        }
      }
      this.currentAction.startPerforming = true;
      return this.currentAction.perform();
    };

    Wizard.prototype.redo = function() {
      return this.perform(this.step);
    };

    return Wizard;

  })();

}).call(this);

(function() {
  this.Slide = {
    hide: function(selector, speed, callback) {
      return $(selector).animate({
        width: 0,
        paddingLeft: 0,
        paddingRight: 0
      }, speed, callback);
    },
    show: function(selector, speed, callback) {
      return $(selector).animate({
        width: 300,
        paddingLeft: 10,
        paddingRight: 10
      }, speed, callback);
    }
  };

}).call(this);

(function() {
  this.UI = {
    showMeasureDescription: function(description) {
      description || (description = "");
      return $("#measure-help").html(description);
    },
    infoUser: function(message, cssClass, duration) {
      if (duration == null) {
        duration = 4000;
      }
      $("#message").html(message);
      $("#message").attr('class', "alert-" + cssClass);
      $("#message").show();
      if (this.hideTimeout != null) {
        clearTimeout(this.hideTimeout);
      }
      return this.hideTimeout = setTimeout((function() {
        return $("#message").hide("slow");
      }), duration);
    },
    flashScreen: function() {
      $('body').animate({
        opacity: 0
      }, 100);
      return $('body').animate({
        opacity: 1
      }, 300);
    },
    audio: function(id, extension) {
      var sound;
      sound = document.createElement("audio");
      sound.id = id;
      sound.src = "/audio/" + id + "." + extension;
      return sound;
    },
    showHideCountdown: function(show, delay) {
      var h;
      if (delay == null) {
        delay = 500;
      }
      if (show) {
        return $("#countdown").show();
      } else {
        h = function() {
          return $("#countdown").hide();
        };
        return setTimeout(h, delay);
      }
    },
    progress: function(percent) {
      $("#countdown").html("" + (parseInt(percent)) + "%");
      return this.showHideCountdown(percent < 100);
    },
    countdown: function(seconds) {
      $("#countdown").html("" + seconds);
      return this.showHideCountdown(seconds > 0);
    },
    performanceReport: function(time) {
      var color;
      $("#performance").html("" + time + "ms");
      if (time > 500) {
        color = 'red';
      } else if (time > 200) {
        color = 'yellow';
      } else if (time > 80) {
        color = 'blue';
      } else {
        color = 'green';
      }
      return $("#performance").attr('color', color);
    },
    toggleHelp: function() {
      var help;
      if (UI.showingHelp == null) {
        if ((wizard.currentAction != null) && ((help = wizard.currentAction.help) != null)) {
          $("#help-content").html(help.content);
          $("#help-title").html(help.title);
        }
        Slide.show(".help-content-wrapper", 1000);
        return UI.showingHelp = true;
      } else {
        delete UI.showingHelp;
        return Slide.hide(".help-content-wrapper", 1000);
      }
    },
    toggleSidemenu: function(arg) {
      if ((UI.showingSidemenu == null) || arg === 'open') {
        Slide.show(".sidemenu-content-wrapper", 1000);
        return UI.showingSidemenu = true;
      } else {
        delete UI.showingSidemenu;
        return Slide.hide(".sidemenu-content-wrapper", 1000);
      }
    }
  };

  this.App = {
    readCookie: function(name) {
      var c, ca, i, nameEQ;
      nameEQ = name + "=";
      ca = document.cookie.split(";");
      i = 0;
      while (i < ca.length) {
        c = ca[i];
        while (c.charAt(0) === " ") {
          c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
          return c.substring(nameEQ.length, c.length).replace(/"/g, '');
        }
        i++;
      }
    },
    setCookie: function(cookieName, cookieValue) {
      var expire;
      expire = new Date();
      expire.setMonth(expire.getMonth() + 6);
      return document.cookie = cookieName + "=" + escape(cookieValue) + ";expires=" + expire.toGMTString();
    },
    expireCookie: function(cookieName) {
      return document.cookie = "" + cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    },
    resizeScreen: function() {
      var value, value_;
      value_ = window.innerHeight / canvas.height * 0.8;
      if (window.innerWidth < window.innerHeight) {
        value_ = window.innerWidth / canvas.width;
      }
      value = "scaleY(" + value_ + ") scaleX(" + value_ + ")";
      $('#canvas-measures').css({
        '-webkit-transform': value,
        '-moz-transform': value,
        '-ms-transform': value,
        '-o-transform': value,
        'transform': value
      });
      if (canvasPreview.mirrorCamera) {
        value = "scaleY(" + value_ + ") scaleX(" + (-value_) + ")";
      }
      return $('#canvas, #video').css({
        '-webkit-transform': value,
        '-moz-transform': value,
        '-ms-transform': value,
        '-o-transform': value,
        'transform': value
      });
    }
  };

  $(document).ready(function() {
    var canvas, canvasLarge, context, contextLarge, video;
    video = $('#video')[0];
    canvasLarge = $("#canvas")[0];
    canvas = $("<canvas width='320' height='240'></canvas>")[0];
    $("#modal-welcome").modal({
      keyboard: false,
      backdrop: 'static'
    });
    $("#help .help-title-wrapper").on("click", function() {
      return UI.toggleHelp();
    });
    $("#sidemenu .sidemenu-title-wrapper").on("click", function() {
      return UI.toggleSidemenu();
    });
    $("input[type=button].next-step").on("click", function() {
      var _ref;
      if ((_ref = $(this).parents(".modal")) != null) {
        _ref.modal('hide');
      }
      if (UI.showingHelp != null) {
        UI.toggleHelp();
      }
      if (UI.showingSidemenu != null) {
        UI.toggleSidemenu();
      }
      return wizard.next();
    });
    $("input[type=button].perform-step").on("click", function() {
      var _ref;
      if ((_ref = $(this).parents(".modal")) != null) {
        _ref.modal('hide');
      }
      if (UI.showingHelp != null) {
        UI.toggleHelp();
      }
      if (UI.showingSidemenu != null) {
        UI.toggleSidemenu();
      }
      return wizard.perform();
    });
    $("#thumbnail-front").on("click", function() {
      return adjustMeasuresStep.setCurrentStep('front');
    });
    $("#thumbnail-side").on("click", function() {
      return adjustMeasuresStep.setCurrentStep('side');
    });
    context = canvas.getContext('2d');
    contextLarge = canvasLarge.getContext('2d');
    window.canvasPreview = new CanvasPreview(contextLarge);
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.gui = new dat.GUI();
    window.segmentation = new Segmentation(canvas, video);
    window.wizard = new Wizard();
    window.search = new Search();
    window.cameraDetector = new DetectCameraStep(wizard, segmentation, navigator, video, $('#modal-camera-detect'));
    window.creditCardMeasureStep = new CreditCardMeasureStep(wizard, $("#modal-credit-card-measure"));
    window.handMeasureStep = new HandMeasureStep(wizard, creditCardMeasureStep, $("#modal-hand-measure"));
    window.backgroundTracker = new BackgroundTrackerStep(wizard, segmentation, $('#modal-background-tracker'));
    window.bodyMeasurementStep = new BodyMeasurementStep(wizard, canvasLarge, segmentation, $('#modal-body-measurement-front'));
    window.bodySideMeasurementStep = new BodyMeasurementStep(wizard, canvasLarge, segmentation, $('#modal-body-measurement-side'), "side");
    window.adjustMeasuresStep = new AdjustMeasuresStep(wizard, bodyMeasurementStep, bodySideMeasurementStep, $('#modal-adjust-measures'));
    window.showResultsStep = new ShowResultsStep(wizard, bodyMeasurementStep, bodySideMeasurementStep, $('#modal-show-results'));
    wizard.push(cameraDetector);
    wizard.push(creditCardMeasureStep);
    wizard.push(handMeasureStep);
    wizard.push(bodyMeasurementStep);
    wizard.push(bodySideMeasurementStep);
    wizard.push(backgroundTracker);
    wizard.push(adjustMeasuresStep);
    wizard.push(showResultsStep);
    App.resizeScreen();
    return window.onresize = App.resizeScreen;
  });

}).call(this);
