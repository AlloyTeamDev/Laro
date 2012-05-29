/**
 * layer for render
 * {Class}
 */

Laro.register('.world', function (La) {
    var Class = La.base.Class || Laro.Class,
        assert = La.err.assert,
        Rectf = La.geometry.Rectf;

    // tiles ��һ��list
    // ����Ԫ�飨imageW, x, y, centered, flipped��
    // *��ʱҪ��Ϊ����
    var Layer = Class(function (tiles) {
        if (tiles != undefined) {
            this.tiles = tiles;
            this.image = this.tiles[0].image;
            assert(this.count > 0, 'arguments of Layer is not enough');
        }	
    }).methods({
        count: function () {
            return this.tiles.length / 5;
        },
        // ��ȡ��ǰlayer Ԫ����layers list �Ĳ������ʵ��λ��
        offset: function (i) {
            return i * 5;
        }
    });

    /**
     * TileLayer
     * ��ͼ��
     * @inherit from Layer
     * tiles @param �������tile ��Ԫ��
     * indices @param {Array} ���ڱ�Ǳ��ֳ�ÿһС���ͼ��λ��
     * sx @param {Number} ����tile�ĸ���
     * sy @param {Number} ����tile�ĸ���
     */
    var TileLayer = Layer.extend(function (tiles, indices, sx, sy) {
        assert(indices.length == sx * sy);
        this.indices = indices;
        this.sx = sx;
        this.sy = sy;
    }).methods({
        // ��ȡָ��λ��tile
        // i, j ���Ǵ�0 ��ʼ
        index : function (i, j) {
            return this.indices[i + this.sx * j];
        },
        // ��ȡ��Ӧtile�����õ�λ��
        tile: function (i, j) {
            var ind = j == null ? i : this.index(i, j);
            return ind == -1 ? -1 : ind * 5;
        },
        // ��ȡ��һ��ָ��λ�õ���һ��tile
        previous: function (i, j) {
            if (i === 0) {
                return j == 0 ? -1 : this.index(this.sx - 1, j - 1)
            } else {
                return this.index(i - 1, j);
            }
        }
    });

    /**
     * SpriteLayer
     * �����
     * @inherit from Layer
     * tiles @param {Array} tile Ԫ����ɵ�list
     * rectangles @param {Rect} ���α߿�
     * rect @param {Rect}
     */
    var SpriteLayer = Layer.extend(function (tiles, rectangles, rect) {
        assert(rect instanceof Rectf);
        this.rectangles = rectangles;
        this.rect = rect;
    });

    this.Layer = Layer;
    this.TileLayer = TileLayer;
    this.SpriteLayer = SpriteLayer;

    Laro.extend(this);
});
