console.log("woohoooo. sanity checking script.js");
//no ES6  in this file!!!

(function () {
    new Vue({
        el: "main",
        data: {
            heading: "I 😽 PIXELS",
            subheading: "Latest Images",
            cuteAnimals: [],
        },
        mounted: function () {
            console.log("mounted is running!!!!");
            //console.log("this befrore then", this);
            var that = this;

            axios
                .get("/pictures")

                .then(function (resp) {
                    console.log(
                        "resp.data.cuteAnimals: ",
                        resp.data.cuteAnimals
                    );

                    that.cuteAnimals = resp.data.cuteAnimals;
                    console.log("that.cuteAnimals: ", that.cuteAnimals);
                })
                .catch(function (err) {
                    console.log("err in Get cute/animals: ", err);
                });
        },
    });
})();
