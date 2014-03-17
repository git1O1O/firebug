/* See license.txt for terms of usage */

/**
 * This file defines MutationRecognizer APIs for test drivers.
 */

// ********************************************************************************************* //

/**
 * This object is intended for handling HTML changes that can occur on a page.
 * This is useful e.g. in cases when a test expects specific element to be created and
 * wants to asynchronously wait for it.
 * @param {Window} win Parent window.
 * @param {String} tagName Name of the element.
 * @param {Object} attributes List of attributes that identifies the element.
 * @param {String} text Specific text that should be created. The tagName must be set to
 * @param {Object} attributes to be watched, defaults to 'attributes'; use for removals
 * <i>Text</i> in this case.
 *
 * @class
 */
var MutationRecognizer = function(config)
{
    this.target = config.target;
    this.mutationFilter = new MutationFilter(config);
};

MutationRecognizer.prototype.getDescription = function()
{
    return mutationFilter.getDescription();
};

/**
 * Passes a callback handler that is called when specific HTML change
 * occurs on the page.
 * @param {Function} handler Callback handler gets one parameter specifying the founded element.
 */
MutationRecognizer.prototype.onRecognize = function(handler)
{
    this.mutationFilter.handler = handler;
    return new MutationObserver(this.mutationFilter.filter);
};

/**
 * Passes a callback handler that is called when specific HTML change
 * occurs on the page. After the change is caught, the handler is executed yet
 * asynchronously.
 * @param {Function} handler Callback handler gets one parameter specifying the founded element.
 * @delay {Number} delay Number of milliseconds delay (10ms by default).
 */
MutationRecognizer.prototype.onRecognizeAsync = function(handler, delay)
{
    if (!delay)
        delay = 10;

    this.mutationFilter.handler = function(node)
    {
        setTimeout(function delayMutationEventFilter()
        {
            FBTest.sysout("testFirebug.MutationEventFilter.onRecognizeAsync:", node);
            handler(node);
        }, delay);
    };

    var observer = new MutationObserver(this.mutationFilter.filter);
    var config = {};
    if (this.mutationFilter.addedChildTag || this.mutationFilter.removedChildTag)
    {
        config.childList = true;
        config.subtree = true;
    }
    else if (this.mutationFilter.changedAttribute)
    {
        config.attributes = true;
        config.attributeFilter = [this.mutationFilter.changedAttribute];
    }
    else if (this.mutationFilter.characterData)
    {
        config.characterData = true;
    }

    FBTrace.sysout("this.target", {target: this.target, config: config});
    observer.observe(this.target, config);
};
