/**
 * util of geometry
 * @require [global]
 */

Laro.register('.geometry.util', function (La) {

    var slice = Array.prototype.slice,
        toType = La.toType,
        self = this;

    var findNumber = function (p, arr) {
        var result = arr.splice(0, 1)[0];

        for (var i = 0; i < arr.length; i ++) {
            if (toType(arr[i]) == 'number') {
                result = Math[p](result, arr[i]);
            }
        }
        return result;
    } 
    // ���ؼ���������С�Ǹ�	
    this.min = Math.min;

    // ����������
    this.max = Math.max;

    // �����������м��Ǹ�
    this.clamp = function (arg) {
        var arr = toType(arg) == 'array' ? arg : slice.call(arguments, 0),
            _min = Math.min(arr[0], Math.min(arr[1], arr[2]));
        if (arr.length === 3) {
            for (var i = 0; i < arr.length; i ++) {
                if (arr[i] === _min) {
                    arr.splice(i, 1);
                    break;
                }
            }
            return Math.min(arr[0], arr[1]);
        }
    };
    // ����ָ����ֵϵ����������ֵ
    this.lerp = function (from, to, t) {
        return from + t * (to - from);
    };


    Laro.extend(this);
})
