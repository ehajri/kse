var theThing = null;

var replaceThing = function() {
    var originalThing = theThing;
    theThing = {
        longStr: new Array(1000000).join('*'),
        someMethod: function() {
            console.log(someMessage);
        }
    };
};
replaceThing();