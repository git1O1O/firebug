/* See license.txt for terms of usage */

/**
 * This file defines MutationFilter APIs for test drivers.
 */

// ********************************************************************************************* //
// Mutation Filter API

/**
 * Mutation filter element
 * 
 * @typedef {Object} MutationFilterElement
 * @property {String} name - Tag name that will be searched for
 * @property {Object} attributes - Name/value pairs of attributes that will be searched for
 */

/**
 * Mutation filter config
 * 
 * @typedef {Object} MutationFilterConfig
 * @property {Element} target - Element that will be observed
 * @property {MutationFilterElement} [addedChildTag] - Added element the filter is searching for
 * @property {MutationFilterElement} [removedChildTag] -
 *     Removed element the filter is searching for
 * @property {String} changedAttribute - Name of the changed attribute the filter is searching for
 * @property {String} characterData - Text content that the filter is searching for
 */

/**
 * HTML/XML mutation filter
 * 
 * @param {MutationFilterConfig} config - Filter configuration
 */
function MutationFilter(config)
{
    this.target = config.target;
    if (config.addedChildTag)
    {
        this.addedChildTag = {
            name: config.addedChildTag.name || "",
            attributes: config.addedChildTag.attributes || {}
        };
    }
    else if (config.removedChildTag)
    {
        this.removedChildTag = {
            name: config.removedChildTag.name || "",
            attributes: config.removedChildTag.attributes || {}
        };
    }
    this.changedAttribute = config.changedAttribute;
    this.characterData = config.text;
}

/**
 * Filter callback function for Mutation Observer
 * @external MutationObserver
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver MutationObserver}
 * 
 * @param {Object} mutations - Array of mutation records
 * @returns {Element|NodeAttribute|TextNode} In case the filter is searching for an element the
 *     element is returned, in case a changed attribute is searched the attribute is returned, and
 *     in case a text is searched a text node is returned
 */
MutationFilter.prototype.filter = function(mutations)
{
    function getMatchingNode(mutatedNodes, checkedTag)
    {
        for (var i = 0; i < mutatedNodes.length; i++)
        {
            if (checkedTag.name !== mutatedNodes[i].localName)
                continue;

            var attributes = mutatedNodes[i].attributes;
            for (var attributeName in checkedTag.attributes)
            {
                var attribute = attributes.getNamedItem(attributeName);
                if (!attribute || attribute.value !== checkedTag.attributes[attributeName])
                    return null;
            }

            return mutatedNodes[i];
        }

        return null;
    }

    for (var i = 0; i < mutations.length; i++)
    {
        var mutation = mutations[i];
        switch (mutation.type)
        {
            case "childList":
                if (this.addedChildTag && mutation.addedNodes.length !== 0)
                {
                    var matchingNode = getMatchingNode(mutation.addedNodes, this.addedChildTag);
                    if (matchingNode)
                        return matchingNode;
                }
                else if (this.removedChildTag && mutation.removedNodes.length !== 0)
                {
                    var matchingNode = getMatchingNode(mutation.removedNodes,
                        this.removedChildTag);
                    if (matchingNode)
                        return matchingNode;
                }
                continue;
                break;

            case "attributes":
                if (!this.changedAttribute)
                    continue;

                if (mutation.target === this.target &&
                    mutation.attributeName === this.changedAttribute)
                    return mutation.target.attributes[mutation.attributeName];
                break;

            case "characterData":
                if (!this.characterData)
                    continue;

                if (mutation.target.data === this.characterData)
                    return mutation.target;
                break;
        }
    }
};

/**
 * Returns the mutation filter configuration as string
 * @returns {String} Filter configuration string
 */
MutationFilter.prototype.getDescription = function()
{
    var obj = {
        target: this.target.localName + (this.target.id ? "#" + this.target.id : ""),
        attributes: this.attributes,
        characterData: this.characterData,
        changedAttributes: this.changedAttributes,
    };

    return JSON.stringify(obj);
};
