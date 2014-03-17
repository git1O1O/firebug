/* See license.txt for terms of usage */

/**
 * This file defines MutationEventFilter APIs for test drivers.
 */

// ********************************************************************************************* //
// Mutation Filter API

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
                    {
                        this.handler(matchingNode);
                        return;
                    }
                }
                else if (this.removedChildTag && mutation.removedNodes.length !== 0)
                {
                    var matchingNode = getMatchingNode(mutation.removedNodes,
                        this.removedChildTag);
                    if (matchingNode)
                    {
                        this.handler(matchingNode);
                        return;
                    }
                }
                continue;
                break;

            case "attributes":
                if (!this.changedAttribute)
                    continue;

                if (mutation.target === this.target &&
                    mutation.attributeName === this.changedAttribute)
                {
                    this.handler(mutation.target.attributes[mutation.attributeName]);
                    return;
                }
                break;

            case "characterData":
                if (!this.characterData)
                    continue;

                if (mutation.target.data === this.characterData)
                {
                    this.handler(mutation.target);
                    return;
                }
                break;
        }
    }
};

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
