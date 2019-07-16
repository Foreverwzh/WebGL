
import { stat } from "fs";
import axios from "axios";
export class OBJLoader {

    constructor() {
        // o object_name | g group_name
        this.object_pattern = /^[og]\s*(.+)?/;
        // mtllib file_reference
        this.material_library_pattern = /^mtllib /;
        // usemtl material_name
        this.material_use_pattern = /^usemtl /;

        this.objects = [];
        this.object = {}

        this.vertices = []
        this.normals = []
        this.colors = []
        this.textureCoords = []
        this.materialLibraries = []
    }

    startObject(name, fromDeclaration) {

        // If the current object (initial from reset) is not from a g/o declaration in the parsed
        // file. We need to use it for the first parsed g/o to keep things in sync.
        if (this.object && this.object.fromDeclaration === false) {

            this.object.name = name;
            this.object.fromDeclaration = (fromDeclaration !== false);
            return;

        }

        var previousMaterial = (this.object && typeof this.object.currentMaterial === 'function' ? this.object.currentMaterial() : undefined);

        if (this.object && typeof this.object._finalize === 'function') {

            this.object._finalize(true);

        }

        this.object = {
            name: name || '',
            fromDeclaration: (fromDeclaration !== false),

            geometry: {
                vertices: [],
                normals: [],
                colors: [],
                textureCoords: []
            },
            materials: [],
            smooth: true,

            startMaterial: function (name, libraries) {

                var previous = this._finalize(false);

                // New usemtl declaration overwrites an inherited material, except if faces were declared
                // after the material, then it must be preserved for proper MultiMaterial continuation.
                if (previous && (previous.inherited || previous.groupCount <= 0)) {

                    this.materials.splice(previous.index, 1);

                }

                var material = {
                    index: this.materials.length,
                    name: name || '',
                    mtllib: (Array.isArray(libraries) && libraries.length > 0 ? libraries[libraries.length - 1] : ''),
                    smooth: (previous !== undefined ? previous.smooth : this.smooth),
                    groupStart: (previous !== undefined ? previous.groupEnd : 0),
                    groupEnd: - 1,
                    groupCount: - 1,
                    inherited: false,

                    clone: function (index) {

                        var cloned = {
                            index: (typeof index === 'number' ? index : this.index),
                            name: this.name,
                            mtllib: this.mtllib,
                            smooth: this.smooth,
                            groupStart: 0,
                            groupEnd: - 1,
                            groupCount: - 1,
                            inherited: false
                        };
                        cloned.clone = this.clone.bind(cloned);
                        return cloned;

                    }
                };

                this.materials.push(material);

                return material;

            },

            currentMaterial: function () {

                if (this.materials.length > 0) {

                    return this.materials[this.materials.length - 1];

                }

                return undefined;

            },

            _finalize: function (end) {

                var lastMultiMaterial = this.currentMaterial();
                if (lastMultiMaterial && lastMultiMaterial.groupEnd === - 1) {

                    lastMultiMaterial.groupEnd = this.geometry.vertices.length / 3;
                    lastMultiMaterial.groupCount = lastMultiMaterial.groupEnd - lastMultiMaterial.groupStart;
                    lastMultiMaterial.inherited = false;

                }

                // Ignore objects tail materials if no face declarations followed them before a new o/g started.
                if (end && this.materials.length > 1) {

                    for (var mi = this.materials.length - 1; mi >= 0; mi--) {

                        if (this.materials[mi].groupCount <= 0) {

                            this.materials.splice(mi, 1);

                        }

                    }

                }

                // Guarantee at least one empty material, this makes the creation later more straight forward.
                if (end && this.materials.length === 0) {

                    this.materials.push({
                        name: '',
                        smooth: this.smooth
                    });

                }

                return lastMultiMaterial;

            }
        };

        if (previousMaterial && previousMaterial.name && typeof previousMaterial.clone === 'function') {

            var declared = previousMaterial.clone(0);
            declared.inherited = true;
            this.object.materials.push(declared);

        }

        this.objects.push(this.object);

    }

    finalize() {

        if (this.object && typeof this.object._finalize === 'function') {

            this.object._finalize(true);

        }

    }

    parseVertexIndex(value, len) {

        var index = parseInt(value, 10);
        return (index >= 0 ? index - 1 : index + len / 3) * 3;

    }

    parseNormalIndex(value, len) {

        var index = parseInt(value, 10);
        return (index >= 0 ? index - 1 : index + len / 3) * 3;

    }

    parseUVIndex(value, len) {

        var index = parseInt(value, 10);
        return (index >= 0 ? index - 1 : index + len / 2) * 2;

    }

    addVertex(x, y, z) {

        var src = this.vertices;
        var dst = this.object.geometry.vertices;

        dst.push(src[x + 0], src[x + 1], src[x + 2]);
        dst.push(src[y + 0], src[y + 1], src[y + 2]);
        dst.push(src[z + 0], src[z + 1], src[z + 2]);

    }

    addVertexPoint(a) {

        var src = this.vertices;
        var dst = this.object.geometry.vertices;

        dst.push(src[a + 0], src[a + 1], src[a + 2]);

    }

    addVertexLine(a) {

        var src = this.vertices;
        var dst = this.object.geometry.vertices;

        dst.push(src[a + 0], src[a + 1], src[a + 2]);

    }

    addNormal(a, b, c) {

        var src = this.normals;
        var dst = this.object.geometry.normals;

        dst.push(src[a + 0], src[a + 1], src[a + 2]);
        dst.push(src[b + 0], src[b + 1], src[b + 2]);
        dst.push(src[c + 0], src[c + 1], src[c + 2]);

    }

    addColor(a, b, c) {

        var src = this.colors;
        var dst = this.object.geometry.colors;

        dst.push(src[a + 0], src[a + 1], src[a + 2]);
        dst.push(src[b + 0], src[b + 1], src[b + 2]);
        dst.push(src[c + 0], src[c + 1], src[c + 2]);

    }

    addUV(a, b, c) {

        var src = this.textureCoords;
        var dst = this.object.geometry.textureCoords;

        dst.push(src[a + 0], src[a + 1]);
        dst.push(src[b + 0], src[b + 1]);
        dst.push(src[c + 0], src[c + 1]);

    }

    addUVLine(a) {

        var src = this.textureCoords;
        var dst = this.object.geometry.textureCoords;

        dst.push(src[a + 0], src[a + 1]);

    }

    addFace(a, b, c, ua, ub, uc, na, nb, nc) {

        var vLen = this.vertices.length;

        var ia = this.parseVertexIndex(a, vLen);
        var ib = this.parseVertexIndex(b, vLen);
        var ic = this.parseVertexIndex(c, vLen);

        this.addVertex(ia, ib, ic);

        if (ua !== undefined && ua !== '') {

            var uvLen = this.textureCoords.length;
            ia = this.parseUVIndex(ua, uvLen);
            ib = this.parseUVIndex(ub, uvLen);
            ic = this.parseUVIndex(uc, uvLen);
            this.addUV(ia, ib, ic);

        }

        if (na !== undefined && na !== '') {

            // Normals are many times the same. If so, skip function call and parseInt.
            var nLen = this.normals.length;
            ia = this.parseNormalIndex(na, nLen);

            ib = na === nb ? ia : this.parseNormalIndex(nb, nLen);
            ic = na === nc ? ia : this.parseNormalIndex(nc, nLen);

            this.addNormal(ia, ib, ic);

        }

        if (this.colors.length > 0) {

            this.addColor(ia, ib, ic);

        }

    }

    addPointGeometry(vertices) {

        this.object.geometry.type = 'Points';

        var vLen = this.vertices.length;

        for (var vi = 0, l = vertices.length; vi < l; vi++) {

            this.addVertexPoint(this.parseVertexIndex(vertices[vi], vLen));

        }

    }

    addLineGeometry(vertices, textureCoords) {

        this.object.geometry.type = 'Line';

        var vLen = this.vertices.length;
        var uvLen = this.textureCoords.length;

        for (var vi = 0, l = vertices.length; vi < l; vi++) {

            this.addVertexLine(this.parseVertexIndex(vertices[vi], vLen));

        }

        for (var uvi = 0, l = textureCoords.length; uvi < l; uvi++) {

            this.addUVLine(this.parseUVIndex(textureCoords[uvi], uvLen));

        }

    }

    load(url, onLoad, onProgress, onError) {

        const scope = this;

        // var loader = new THREE.FileLoader( scope.manager );
        // loader.setPath( this.path );
        // loader.load( url, function ( text ) {

        //     onLoad( scope.parse( text ) );

        // }, onProgress, onError );
        axios.get(url).then(res => {
            onLoad(scope.parse(res.data));
        })

    }

    setPath(path) {
        this.path = path;
    }

    parse(text) {

        console.time('OBJLoader');

        const scope = this;

        if (text.indexOf('\r\n') !== - 1) {

            // This is faster than String.split with regex that splits on both
            text = text.replace(/\r\n/g, '\n');

        }

        if (text.indexOf('\\\n') !== - 1) {

            // join lines separated by a line continuation character (\)
            text = text.replace(/\\\n/g, '');

        }

        var lines = text.split('\n');
        var line = '', lineFirstChar = '';
        var lineLength = 0;
        var result = [];

        // Faster to just trim left side of the line. Use if available.
        var trimLeft = (typeof ''.trimLeft === 'function');

        for (var i = 0, l = lines.length; i < l; i++) {

            line = lines[i];

            line = trimLeft ? line.trimLeft() : line.trim();

            lineLength = line.length;

            if (lineLength === 0) continue;

            lineFirstChar = line.charAt(0);

            // @todo invoke passed in handler if any
            if (lineFirstChar === '#') continue;

            if (lineFirstChar === 'v') {

                var data = line.split(/\s+/);

                switch (data[0]) {

                    case 'v':
                        scope.vertices.push(
                            parseFloat(data[1]),
                            parseFloat(data[2]),
                            parseFloat(data[3])
                        );
                        if (data.length === 8) {

                            scope.colors.push(
                                parseFloat(data[4]),
                                parseFloat(data[5]),
                                parseFloat(data[6])

                            );

                        }
                        break;
                    case 'vn':
                        scope.normals.push(
                            parseFloat(data[1]),
                            parseFloat(data[2]),
                            parseFloat(data[3])
                        );
                        break;
                    case 'vt':
                        scope.textureCoords.push(
                            parseFloat(data[1]),
                            parseFloat(data[2])
                        );
                        break;

                }

            } else if (lineFirstChar === 'f') {

                var lineData = line.substr(1).trim();
                var vertexData = lineData.split(/\s+/);
                var faceVertices = [];

                // Parse the face vertex data into an easy to work with format

                for (var j = 0, jl = vertexData.length; j < jl; j++) {

                    var vertex = vertexData[j];

                    if (vertex.length > 0) {

                        var vertexParts = vertex.split('/');
                        faceVertices.push(vertexParts);

                    }

                }

                // Draw an edge between the first vertex and all subsequent vertices to form an n-gon

                var v1 = faceVertices[0];

                for (var j = 1, jl = faceVertices.length - 1; j < jl; j++) {

                    var v2 = faceVertices[j];
                    var v3 = faceVertices[j + 1];

                    scope.addFace(
                        v1[0], v2[0], v3[0],
                        v1[1], v2[1], v3[1],
                        v1[2], v2[2], v3[2]
                    );

                }

            } else if (lineFirstChar === 'l') {

                var lineParts = line.substring(1).trim().split(" ");
                var lineVertices = [], lineUVs = [];

                if (line.indexOf("/") === - 1) {

                    lineVertices = lineParts;

                } else {

                    for (var li = 0, llen = lineParts.length; li < llen; li++) {

                        var parts = lineParts[li].split("/");

                        if (parts[0] !== "") lineVertices.push(parts[0]);
                        if (parts[1] !== "") lineUVs.push(parts[1]);

                    }

                }
                scope.addLineGeometry(lineVertices, lineUVs);

            } else if (lineFirstChar === 'p') {

                var lineData = line.substr(1).trim();
                var pointData = lineData.split(" ");

                scope.addPointGeometry(pointData);

            } else if ((result = this.object_pattern.exec(line)) !== null) {

                // o object_name
                // or
                // g group_name

                // WORKAROUND: https://bugs.chromium.org/p/v8/issues/detail?id=2869
                // var name = result[ 0 ].substr( 1 ).trim();
                var name = (" " + result[0].substr(1).trim()).substr(1);

                scope.startObject(name);

            } else if (this.material_use_pattern.test(line)) {

                // material

                scope.object.startMaterial(line.substring(7).trim(), scope.materialLibraries);

            } else if (this.material_library_pattern.test(line)) {

                // mtl file

                scope.materialLibraries.push(line.substring(7).trim());

            } else if (lineFirstChar === 's') {

                result = line.split(' ');

                // smooth shading

                // @todo Handle files that have varying smooth values for a set of faces inside one geometry,
                // but does not define a usemtl for each face set.
                // This should be detected and a dummy material created (later MultiMaterial and geometry groups).
                // This requires some care to not create extra material on each smooth value for "normal" obj files.
                // where explicit usemtl defines geometry groups.
                // Example asset: examples/models/obj/cerberus/Cerberus.obj

                /*
                    * http://paulbourke.net/dataformats/obj/
                    * or
                    * http://www.cs.utah.edu/~boulos/cs3505/obj_spec.pdf
                    *
                    * From chapter "Grouping" Syntax explanation "s group_number":
                    * "group_number is the smoothing group number. To turn off smoothing groups, use a value of 0 or off.
                    * Polygonal elements use group numbers to put elements in different smoothing groups. For free-form
                    * surfaces, smoothing groups are either turned on or off; there is no difference between values greater
                    * than 0."
                    */
                if (result.length > 1) {

                    var value = result[1].trim().toLowerCase();
                    scope.object.smooth = (value !== '0' && value !== 'off');

                } else {

                    // ZBrush can produce "s" lines #11707
                    scope.object.smooth = true;

                }
                var material = scope.object.currentMaterial();
                if (material) material.smooth = scope.object.smooth;

            } else {

                // Handle null terminated files without exception
                if (line === '\0') continue;

                throw new Error('OBJLoader: Unexpected line: "' + line + '"');

            }

        }

        scope.finalize();

        // for ( var i = 0, l = scope.objects.length; i < l; i ++ ) {

        // 	var object = scope.objects[ i ];
        // 	var geometry = object.geometry;
        // 	var materials = object.materials;
        // 	var isLine = ( geometry.type === 'Line' );
        // 	var isPoints = ( geometry.type === 'Points' );
        // 	var hasVertexColors = false;
        // }
        console.timeEnd('OBJLoader');
        return scope;

    }

}