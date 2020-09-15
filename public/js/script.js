console.log("woohoooo. sanity checking script.js");
//no ES6  in this file!!!
//i see this console.logs in the browser

(function () {
    new Vue({
        el: "main",
        data: {
            heading: "I 😽 PIXELS",
            subheading: "Latest Images",
            cutePictures: [],
            //these data properties will store values of input fields
            title: "",
            description: "",
            username: "",
            file: null,
        },
        mounted: function () {
            console.log("mounted is running!!!!");
            //console.log("this befrore then", this);
            var that = this;

            axios
                .get("/pictures")

                .then(function (resp) {
                    //console.log(
                    //    "resp.data.cutePictures: ",
                    //    resp.data.cutePictures
                    //);

                    that.cutePictures = resp.data.cutePictures;
                    //console.log("that.cutePictures: ", that.cutePictures);
                })
                .catch(function (err) {
                    console.log("err in Get cutePictures: ", err);
                });
        },
        methods: {
            handleClick: function (e) {
                e.preventDefault();
                console.log("this! ", this);
                /*
                cutePictures: Array(3)
                description: "a"
                file: File
                    name: "IMG_0239.JPG"
                    size: 1038994
                    type: image/jpeg
                    webkitRelativePath: ""
                heading
                subheading
                data: 
                    cutePictures: Array(3)
                    description: "a"
                    file: File
                    title: "a"
                    username: "a"
                */

                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);

                var that = this;

                axios
                    .post("/upload", formData)
                    .then(function (resp) {
                        console.log("that in upload post: ", that);
                        console.log(typeof that.cutePictures);

                        console.log(
                            "uuuuh, I am getting a response from upload!!!!"
                        );
                        console.log("response from post upload ", resp);
                        //data: success: false (wenn ich kein Bild hochgeladen hab)
                        //data: {success: true}
                        //get data & put it in an array
                        console.log("resp.data.image: ", resp.data.image);
                        console.log("cute Pictures: ", that.cutePictures);
                        that.cutePictures.unshift(resp.data.image);
                    })
                    .catch(function (err) {
                        console.log("err from POST upload", err);
                    });
            },
            handleChange: function (e) {
                console.log("handleChange is running!");
                console.log("file: ", e.target.files[0]);
                /*
                file: 
                name: "IMG_0239.JPG"
                size: 1038994
                type: image/jpeg
                webkitRelativePath: ""
                */

                this.file = e.target.files[0];
            },
        },
    });
})();
