class Text extends DIVComponentBase{
    constructor(id, code, container, workMode, option = {}, useDefaultOpt = true) {
        super(id, code, container, workMode, option, useDefaultOpt);
        this._setupDefaultValues();
        this._draw();
        this.workMode = workMode;
        if (workMode !== 2 && workMode !== 0) {
            this._getWSData();
        }
    }
}