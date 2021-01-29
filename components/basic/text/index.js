class Text extends DIVComponentBase{
    constructor(id, code, container, workMode, option = {}, useDefaultOpt = true) {
        super(id, code, container, workMode, option, useDefaultOpt);
        this._setupDefaultValues();
        this._draw();
        this.workMode = workMode;
    }

    _draw() {
        super._draw();
    }
}