/**
 * state for fsm
 */

Laro.register('.game', function (La) {

    var Class = La.Class || La.base.Class,
        toType = La.toType;

    // 以下state类的方法 都需要 子类重写后调用。
    var BaseState = Class(function (host, fsm, id) {
        if (host == undefined || toType(host) != 'object') return;
        this.host = host;
        this.fsm = fsm;
        this.stateId = id;
        this.isSuspended = false;

    }).methods({
        enter: function (msg, fromState) {throw 'no enter'},
        leave: function () {throw 'no leave'},
        update: function (dt) {throw 'no update'},
        suspended: function (dt) {throw 'no suspended'},
        message: function (msg) { throw 'no message'},
        suspend: function () {throw 'no suspend'},
        resume: function (msg, fromState) {throw 'no resume'},
        preload: function () {throw 'no preload'},
        cancelPreload: function () {throw 'no cancelPreload'},
        transition: function () { return false }

    });

    /**
     * SimpleState
     */
    var SimpleState = BaseState.extend(function (id, enterFn, leaveFn, updateFn) {
        this.stateId = id;
        var emptyFn = function () {};
        this.isSuspended = false;

        this.enter = enterFn != null ? enterFn : emptyFn;
        this.leave = leaveFn != null ? leaveFn : emptyFn;
        this.update = updateFn != null ? updateFn : emptyFn;
    });

    this.BaseState = BaseState;
    this.SimpleState = SimpleState;

})
