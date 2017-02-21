var lib = {
  traverse: require('traverse'),
  xml: require('xml')
};
var addAtribute = true;

function prepareXmlObject(value) {
  if (typeof value != 'object') {
    value = {item:value};
  }
  return lib.traverse(value).map(setUpPostProcessing);
}

function setUpPostProcessing(value) {
  this.after(transformXmlObject);
}

function transformXmlObject(value) {
  var type = typeof value;
  if (type == 'object') {
    if (Array.isArray(value)) {
      var items = [];
      addAtribute && items.push({_attr:{type:'array'}});
      items = items.concat(value.map(function(item) {
        return {item:item};
      }));
      if (!this.parent) {
        this.update({items:items});
      }
      else {
        this.update(items);
      }
    }
    else {
      var elements = [];
      for (var key in value) {
        var element = {};
        // fix incomatible xml, tagname is not allowed to start with number
        // instead <123>val</123> convert to: <key name="123">val</key>
        if (Number.isInteger(Number.parseInt(key.charAt(0)))) {
          element['key'] = [{_attr:{name: key}}, value[key]];
        } else {
          element[key] = value[key];
        }
        elements.push(element);
      }
      this.update(elements);
    }
  }
}

module.exports = function xml(value, options, addArrAtribute) {
  if (typeof addArrAtribute == 'boolean') {
    addAtribute = addArrAtribute;
  }
  return lib.xml(prepareXmlObject(value), options);
};
