/**
 * Image Wrapper
 * ��ͼƬ���ϰ�װ������һЩ����Ĳ�����ʹ��
 */

Laro.register('.texture', function (La) {
    var assert = La.err.assert,
        Class = La.base.Class || la.Class;

    /**
     * ����һ��ͼƬ�Ĳ�������
     * param {Image} htmlImageElement
     * param {number} ��Ҫʹ�õ�region��x����
     * param {number} region��y����
     * param {number} region ��
     * param {number} region ��
     * param {number} x ����paddingֵ
     * param {number} y ����padding
     * param {number} ��Ҫʹ����������Ŀ����
     * param {number} Ŀ��߶�
     */
    var ImageRegion = Class(function (image, x, y, width, height, offsetX, offsetY, textureW, textureH) {
        assert(image instanceof HTMLImageElement || image instanceof HTMLCanvasElement, 'invalid image');
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.offsetX = offsetX == null ? 0 : offsetX;
        this.offsetY = offsetY == null ? 0 : offsetY;
        this.textureWidth = textureW == null ? width : textureW;
        this.textureHeight = textureH == null ? height : textureH;
        this.hasPadding = (offsetX > 0) || (offsetY > 0) || (textureW > width) || (textureH > height);
    }).methods({
        getImageWidth : function () {
            return this.image.width;
        },
        getImageHeight: function () {
            return this.image.height;
        }
    });

    this.ImageRegion = ImageRegion;
    this.EMBImage = ImageRegion;

    Laro.extend(this);

})
