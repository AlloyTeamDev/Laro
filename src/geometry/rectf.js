/**
 * Class Rectf
 * ����һ������
 */

Laro.register('.geometry', function (La) {

    this.Circle = function Circle(cent, rad) {
        this.c = cent;
        this.r = rad;
    };
    La.Circle = this.Circle;

    var Class = La.base.Class || La.Class,
        assert = La.err.assert,
        Vector2 = La.geometry.Vector2,
        Point2 = La.geometry.Point2,
        Circle = La.geometry.Circle || this.Circle;

    var Rectf = Class(function (x0, y0, x1, y1) {
        this.x0 = x0;
        this.x1 = x1;
        this.y0 = y0;
        this.y1 = y1;
        this.width = x1 - x0 + 1;
        this.height = y1 - y0 + 1;
    }).methods({
        // �������ģ�����һ������
        center: function () {
            return new Vector2((this.x0 + this.x1 + 1)/2, (this.y0 + this.y1 + 1)/2);
        },
        // ��ָ���ᷭת
        invertBy: function (f) {
            f = f || 'x';
            if (f == 'x') {
                return new Rectf(-this.x1, this.y0, -this.x0, this.y1);
            } else if (f == 'y') {
                return new Rectf(this.x0, -this.y1, this.x1, -this.y0);
            }
        },
        // �ƶ�
        offset: function (x, y) {
            if (x instanceof Vector2 || x instanceof Point2) {
                x = x.x;
                y = x.y;
            }
            return new Rectf(this.x0 + x, this.y0 + y, this.x1 + x, this.y1 + y);
        },
        // ��չ����
        expand: function (w, h) {
            if (w instanceof Vector2 || w instanceof Point2) {
                w = w.x;
                h = w.y;
            }
            return new Rectf(this.x0 - w, this.y0 - h, this.x1 + w, this.y1 + h);
        },
        // ����Ƿ����
        // ֧�� �Ե㣬 ������ ���εļ��
        contains: function (x, y) {
            var o = x;
            if (x instanceof Vector2 || x instanceof Point2) {
                // ��ָ���������İ�����ϵ
                return this.x0 <= o.x
                    && this.y0 <= o.y
                    && this.x1 >= o.x
                    && this.y1 >= o.y;
            } else if (x instanceof Rectf) {
                // ���ΰ�����ϵ���
                return this.x0 <= o.x0
                    && this.y0 <= o.y0
                    && this.x1 >= o.x1
                    && this.y1 >= o.y1;
            } else {
                // �Զ��� x y ����ĵ�
                return this.x0 <= x
                    && this.y0 <= y
                    && this.x1 >= x
                    && this.y1 >= y;
            }
        },
        // �����ж�
        // ֧�� Բ�Σ� ����
        overlaps: function (shape, ox, oy) {
            var r, x, y;
            if (ox == undefined && oy == undefined) {
                ox = 0;
                oy = 0;
            } else if (ox instanceof Vector2 || ox instanceof Point2) {
                ox = ox.x;
                oy = ox.y;
            }

            if (shape instanceof Circle) {
                r = shape.r;
                // Բ��λ��
                x = shape.c.x + ox;
                y = shape.c.y + oy;
                return this.x0 - r <= x
                    && this.y0 - r <= y
                    && this.x1 + r >= x
                    && this.y1 + r >= y;
            } else if (shape instanceof Rectf) {
                return !(this.x0 > shape.x1 + ox || this.x1 < shape.x0 + ox || this.y0 > shape.y1 + oy || this.y1 < shape.y0 + oy);
            } else {
                // TODO
            }
        },
        // �þ���ȥ����һ������
        clip: function (v) {
            return new Vector2(Math.max(this.x0, Math.min(this.x1, v.x)), Math.max(this.y0, Math.min(this.y1, v.y)));	   
        },
        // copy
        copy : function () {
            return new Rectf(this.x0, this.y0, this.x1, this.y1);
        },
        // include
        include: function (x, y) {
            if (x instanceof Vector2 || x instanceof Point2) {
                x = x.x;
                y = x.y;
            }
            this.x0 = Math.min(this.x0, x);
            this.y0 = Math.min(this.y0, y);
            this.x1 = Math.max(this.x1, x);
            this.y1 = Math.max(this.y1, y);
            this.width = this.x1 - this.x0 + 1;
            this.height = this.y1 - this.y0 + 1;
        }
    });

    this.Rectf = Rectf;
    this.Rectangle = Rectf;

    Laro.extend(this);
})
