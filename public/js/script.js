console.log("woohoooo. sanity checking script.js");
//no ES6  in this file!!!
//i see this console.logs in the browser

(function () {
    Vue.component("my-first-component", {
        template: "#my-first-component",
        //tell component that it will be passed a props --> array of strings
        props: ["pictureId"],
        data: function () {
            return {
                url: "",
                title: "",
                description: "",
                oldComments: "",
                username: "",
                comment: "",
            };
        },
        //mounted will run as soon as html is rendered on screen
        mounted: function () {
            //console.log("my component has mounted!!!!");
            console.log("this in component: ", this);
            console.log("this in component: ", this.pictureId);
            let id = this.pictureId;

            var that = this;
            console.log("that in component");
            //i can use axios to make a request to server to get data
            axios
                .get(`/modal/${this.pictureId}`)

                .then(function (resp) {
                    //console.log("response in get comments: ", resp);
                    console.log(
                        "resp.data.image in component modal: ",
                        resp.data.image[0]
                    );

                    that.url = resp.data.image[0].url;
                    that.title = resp.data.image[0].title;
                    that.description = resp.data.image[0].description;
                    //that.comments = "heading was clicked!!!";
                })
                .catch(function (err) {
                    console.log("err in Get comments: ", err);
                });
        },
        //all event handlers go in here!!!
        methods: {
            clickButton: function (e) {
                e.preventDefault();
                //console.log("this in click button! ", this.username);
                //console.log("this in click button! ", this.comment);
                var that = this;
                //console.log("that picture id: ", that.pictureId);

                axios
                    .post(`/comments/${that.pictureId}`, {
                        username: that.username,
                        comment: that.comment,
                    })
                    .then(function (resp) {
                        //console.log("there is a respnse from insert comment");
                        //console.log("that in comments post: ", that);
                        //console.log(
                        //    "response in post comment",
                        //    resp.data.comment.comment
                        //);
                        that.oldComments = resp.data.comment.comment;
                    })
                    .catch(function (err) {
                        console.log("error from post comments", err);
                    });
            },

            changed: function (e) {
                //this.button = "I was clicked!!!!!";
                this.$emit("changed", e.target.value);
            },
        },
    });

    new Vue({
        el: "main",
        data: {
            heading: "I 😽 PIXELS",
            subheading: "Latest Images",
            cutePictures: [],
            //add property showModal for component --> show Modal wil not be rendered unless it becomes true
            showModal: false,
            //add property of animal that was clicked
            pictureId: null,
            //use props to pass info down to child
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
            //add method for component showModal
            //and attach function to html
            handleClickModal: function (id) {
                //console.log("handleclick modal!!!");
                console.log("picture id in vue instance: ", id);
                this.showModal = true;
                this.pictureId = id;
            },
            updateCityName: function () {
                this.showModal = false;
            },
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
