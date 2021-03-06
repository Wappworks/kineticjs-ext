///////////////////////////////////////////////////////////////////////
//  Text
///////////////////////////////////////////////////////////////////////
/**
 * Multi-line text constructor
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.TextMultiline = function(config) {
    /*
     * defaults
     */
    if(config.align === undefined) {
        config.align = "left";
    }
    if(config.verticalAlign === undefined) {
        config.verticalAlign = "top";
    }
    if(config.padding === undefined) {
        config.padding = 0;
    }

    config.drawFunc = function( isForDetection ) {
        var context = this.getContext();
        var fontDesc = this.fontSize + "px";
        if( this.fontWeight !== undefined )
            fontDesc = this.fontWeight + " " + fontDesc;
        if( this.fontFamily !== undefined )
            fontDesc += " " + this.fontFamily;

        context.font = fontDesc;
        context.textBaseline = "middle";

        // Break the text into lines if it hasn't been done yet...
        if( this.lines === undefined )
        {
            this.lines = this.text.split( "\n" );
        }

        var linesNum = this.lines.length;
        var lineHeight = this.fontSize;
        var textBlockHeight = lineHeight * linesNum;
        var p = this.padding;
        var y = 0;

        switch (this.verticalAlign) {
            case "middle":
                y = textBlockHeight / -2 - p;
                break;
            case "bottom":
                y = -1 * textBlockHeight - p;
                break;
        }

        if(this.fill !== undefined) {
            context.fillStyle = this.fill;
        }
        if(this.stroke !== undefined || this.strokeWidth !== undefined) {
            // defaults
            if(this.stroke === undefined) {
                this.stroke = "black";
            } else if(this.strokeWidth === undefined) {
                this.strokeWidth = 2;
            }

            context.lineWidth = this.strokeWidth;
            context.strokeStyle = this.stroke;
        }

        var lineIndex;
        if( !isForDetection )
        {
            for( lineIndex = 0; lineIndex < linesNum; lineIndex++ )
            {
                this._drawTextLine( context, this.lines[lineIndex], y );
                y += lineHeight;
            }
        }
        else
        {
            context.beginPath();
            for( lineIndex = 0; lineIndex < linesNum; lineIndex++ )
            {
                this._drawTextBounds( context, this.lines[lineIndex], y );
                y += lineHeight;
            }
            context.closePath();
        }
    };

    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};
/*
 * Text methods
 */
Kinetic.TextMultiline.prototype = {
    /**
     * set font family
     * @param {String} fontFamily
     */
    setFontFamily: function(fontFamily) {
        this.fontFamily = fontFamily;
        this.invalidateBoundsLocal();
    },
    /**
     * get font family
     */
    getFontFamily: function() {
        return this.fontFamily;
    },
    /**
     * set font size
     * @param {int} fontSize
     */
    setFontSize: function(fontSize) {
        this.fontSize = fontSize;
        this.invalidateBoundsLocal();
    },
    /**
     * get font size
     */
    getFontSize: function() {
        return this.fontSize;
    },
    /**
     * set font weight
     * @param {int} fontWeight
     */
    setFontWeight: function(fontWeight) {
        this.fontWeight = fontWeight;
        this.invalidateBoundsLocal();
    },
    /**
     * get font weight
     */
    getFontWeight: function() {
        return this.fontWeight;
    },
    /**
     * set padding
     * @param {int} padding
     */
    setPadding: function(padding) {
        this.padding = padding;
        this.invalidateBoundsLocal();
    },
    /**
     * get padding
     */
    getPadding: function() {
        return this.padding;
    },
    /**
     * set horizontal align of text
     * @param {String} align align can be "left", "center", or "right"
     */
    setAlign: function(align) {
        this.align = align;
        this.invalidateBoundsLocal();
    },
    /**
     * get horizontal align
     */
    getAlign: function() {
        return this.align;
    },
    /**
     * set vertical align of text
     * @param {String} verticalAlign verticalAlign can be "top", "middle", or "bottom"
     */
    setVerticalAlign: function(verticalAlign) {
        this.verticalAlign = verticalAlign;
        this.invalidateBoundsLocal();
    },
    /**
     * get vertical align
     */
    getVerticalAlign: function() {
        return this.verticalAlign;
    },
    /**
     * set text
     * @param {String} text
     */
    setText: function(text) {
        this.text = text;
        this.lines = undefined;
        this.invalidateBoundsLocal();
    },
    /**
     * get text
     */
    getText: function() {
        return this.text;
    },

    /**
     * draw a line of text
     *
     * @param {CanvasContext} context
     * @param {String} textCurr
     * @param {Number} y
     *
     */
    _drawTextLine: function( context, textCurr, y )
    {
        var metrics = context.measureText(textCurr);
        var textHeight = this.fontSize;
        var textWidth = metrics.width;
        var p = this.padding;
        var x = 0;

        switch (this.align) {
            case "center":
                x = textWidth / -2 - p;
                break;
            case "right":
                x = -1 * textWidth - p;
                break;
        }

        var tx = p + x;
        var ty = textHeight / 2 + p + y;

        // draw text
        if(this.fill !== undefined) {
            context.fillText(textCurr, tx, ty);
        }
        if(this.stroke !== undefined || this.strokeWidth !== undefined) {
            context.strokeText(textCurr, tx, ty);
        }
    },

    /**
     * draw the text bounds
     *
     * @param {CanvasContext} context
     * @param {String} textCurr
     * @param {Number} y
     *
     */
    _drawTextBounds: function( context, textCurr, y )
    {
        var metrics = context.measureText(textCurr);
        var textHeight = this.fontSize;
        var textWidth = metrics.width;
        var p = this.padding;
        var x = 0;

        switch (this.align) {
            case "center":
                x = textWidth / -2 - p;
                break;
            case "right":
                x = -1 * textWidth - p;
                break;
        }

        // draw path
         context.rect(x, y, textWidth + p * 2, textHeight + p * 2);
    },
    /**
     * calculates the untransformed local bounds for the node
     * @returns {Kinetic.BoundsRect}
     */
    _calcNodeBoundsLocalUntransformed: function()
    {
        var context = Kinetic.GlobalObject.getTempCanvasContext();

        context.save();
        var fontDesc = this.fontSize + "px";
        if( this.fontWeight !== undefined )
            fontDesc = this.fontWeight + " " + fontDesc;
        if( this.fontFamily !== undefined )
            fontDesc += " " + this.fontFamily;

        context.font = fontDesc;
        context.textBaseline = "middle";

        // Break the text into lines if it hasn't been done yet...
        if( this.lines === undefined )
        {
            this.lines = this.text.split( "\n" );
        }

        var linesNum = this.lines.length;
        var lineHeight = this.fontSize;
        var textBlockHeight = lineHeight * linesNum;
        var p = this.padding;
        var top = 0;

        switch (this.verticalAlign) {
            case "middle":
                top = textBlockHeight / -2 - p;
                break;
            case "bottom":
                top = -1 * textBlockHeight - p;
                break;
        }

        var leftMin = Number.MAX_VALUE;
        var rightMax = Number.MIN_VALUE;
        for( var lineIndex = 0; lineIndex < linesNum; lineIndex++ )
        {
            var metrics = context.measureText(this.lines[lineIndex]);
            var textWidth = metrics.width;

            var left = 0;
            switch (this.align) {
                case "center":
                    left = textWidth / -2 - p;
                    break;
                case "right":
                    left = -1 * textWidth - p;
                    break;
            }

            leftMin = Math.min( leftMin, left );
            rightMax = Math.max( rightMax, left + textWidth );
        }
        context.restore();

        return( new Kinetic.BoundsRect(leftMin, top, rightMax - leftMin, textBlockHeight) );
    }
};
// extend Shape
Kinetic.GlobalObject.extend(Kinetic.TextMultiline, Kinetic.Shape);