/* See license.txt for terms of usage */

/**
 * This file defines MutationRecognizer APIs for test drivers.
 */

// ********************************************************************************************* //

/**
 * This object is intended for handling HTML changes that can occur on a page.
 * This is useful e.g. in cases when a test expects a specific element to be created and
 * wants to asynchronously wait for it.
 * 
 * @param {MutationFilterConfig} config -
 *     [Mutation filter configuration]{@link MutationFilterConfig}
 */
var MutationRecognizer = function(config)
{
    this.target = config.target;
    this.mutationFilter = new MutationFilter(config);
};

/**
 * Returns the mutation filter configuration as string
 * @returns {String} Filter configuration string
 */
MutationRecognizer.prototype.getDescription = function()
{
    return this.mutationFilter.getDescription();
};

/**
 * Mutation callback function
 * 
 * @callback MutationRecognizer~mutationCallback
 * @param {Object} node - Recognized node; can be an element or character data
 */

/**
 * Recognizes specific HTML/XML structure changes and calls a callback function synchronously.
 * 
 * @param {mutationCallback} handler - Callback function that handles the found node.
 */
MutationRecognizer.prototype.onRecognize = function(handler)
{
    this.mutationFilter.handler = handler;
    return new MutationObserver(this.mutationFilter.filter);
};

/**
 * Recognizes specific HTML/XML structure changes and calls a callback function asynchronously.
 * 
 * @param {mutationCallback} handler - Callback function that handles the found node.
 * @delay {Number} [delay=10] - Number of milliseconds to wait before the callback function is called.
 */
MutationRecognizer.prototype.onRecognizeAsync = function(handler, delay)
{
    if (!delay)
        delay = 10;

    this.mutationFilter.handler = function(node)
    {
        setTimeout(function delayMutationFilter()
        {
            FBTest.sysout("testFirebug.MutationFilter.onRecognizeAsync:", node);
            handler(node);
        }, delay);
    };

    var observer = new MutationObserver((mutations) =>
    {
        var node = this.mutationFilter.filter(mutations);
        FBTrace.sysout("node", node);
        if (node)
        {
            observer.disconnect();
            handler(node);
        }
    });
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

    observer.observe(this.target, config);
};
