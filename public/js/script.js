console.log("sanity checking");

(function () {
    Vue.component("my-first-component", {
        template: "#my-first-component",
        //tell component that it will be passed a props --> array of strings
        props: ["imageId"],
        data: function () {
            return {
                url: "",
                title: "",
                description: "",
                comments: [],
                username: "",
                name: "",
                comment: "",
                nextId: null,
                previousId: null,
            };
        },
        //mounted will run as soon as html is rendered on screen
        mounted: function () {
            let id = this.imageId;
            var that = this;
            //i can use axios to make a request to server to get data
            this.getModalImage(this);

            axios
                .get(`/comments/${this.imageId}`)
                .then(function (resp) {
                    that.comments = resp.data.comments;
                })
                .catch(function (err) {
                    console.log("err in Get modalImage: ", err);
                });
        },
        //adding watchers!!!
        watch: {
            //whenever the prop imageID changes, this function will run
            imageId: function () {
                var that = this;

                if (isNaN(this.imageId)) {
                    that.$emit("close");
                } else {
                    this.comment = "";
                    this.name = "";
                    this.getModalImage(this);

                    axios
                        .get(`/comments/${this.imageId}`)
                        .then(function (resp) {
                            that.comments = resp.data.comments;
                        })
                        .catch(function (err) {
                            console.log("err in Get modalImage: ", err);
                        });
                }
            },
        },

        //all event handlers go in here!!!
        methods: {
            clickButton: function (e) {
                e.preventDefault();

                var that = this;

                axios
                    .post(`/comments/${that.imageId}`, {
                        username: that.username,
                        comment: that.comment,
                    })
                    .then(function (resp) {
                        that.username = resp.data.comment.username;
                        that.comment = resp.data.comment.comment;
                        that.username = "";
                        that.comment = "";
                    })
                    .catch(function (err) {
                        console.log("error from post comments", err);
                    });
            },

            handleClose: function (e) {
                this.$emit("close");
            },

            getModalImage: function (arg) {
                var that = arg;

                axios
                    .get(`/modal/${that.imageId}`)

                    .then(function (resp) {
                        if (resp.data.image[0] == undefined) {
                            that.$emit("close");
                        } else {
                            that.url = resp.data.image[0].url;
                            that.title = resp.data.image[0].title;
                            that.description = resp.data.image[0].description;
                            that.nextId = resp.data.image[0].nextId;
                            that.previousId = resp.data.image[0].previousId;
                        }
                    })
                    .catch(function (err) {
                        console.log("err in Get modalImage: ", err);
                    });
            },
            handleDelete: function (e) {
                e.preventDefault();

                var that = this;
                axios
                    .get(`/delete/${this.imageId}`)
                    .then(function (resp) {
                        that.$emit("close");
                        that.$emit("delete");
                    })
                    .catch(function (err) {
                        console.log("err in delete", err);
                    });
            },
        },
    });

    new Vue({
        el: "main",
        data: {
            //errors
            errors: [],
            heading: "I 😽 PIXELS",
            subheading: "Latest Images",
            cuteImages: [],

            //add property of picture that was clicked
            imageId: location.hash.slice(1),
            //use props to pass info down to child
            //these data properties will store values of input fields
            title: "",
            description: "",
            username: "",
            file: null,
            lastId: null,
            isNight: true,
        },
        mounted: function () {
            var that = this;

            axios
                .get("/images")

                .then(function (resp) {
                    that.cuteImages = resp.data.cuteImages;

                    let arr = that.cuteImages;
                    let arrLast = arr[arr.length - 1];

                    let lastId = arrLast.id;

                    that.lastId = lastId;
                })
                .catch(function (err) {
                    console.log("err in Get cuteImages: ", err);
                });
            //this code makes modal appear when I click different images because data property is being updated
            window.addEventListener("hashchange", function (e) {
                if (isNaN(location.hash.slice(1))) {
                    location.hash = "";
                } else {
                    that.imageId = location.hash.slice(1);
                }
            });
        },
        methods: {
            //add method for component showModal
            //and attach function to html
            closeModal: function () {
                this.imageId = null;
                location.hash = "";
            },
            reloadPage: function () {
                var that = this;

                axios
                    .get("/images")

                    .then(function (resp) {
                        that.cuteImages = resp.data.cuteImages;

                        let arr = that.cuteImages;
                        let arrLast = arr[arr.length - 1];

                        let lastId = arrLast.id;

                        that.lastId = lastId;

                        that.isNight = true;
                    })
                    .catch(function (err) {
                        console.log("err in Get cuteImages: ", err);
                    });
            },

            handleClick: function (e) {
                e.preventDefault();
                this.errors = [];
                // error handling: file size

                if (this.file.size > 1999999) {
                    this.errors.push("Please choose a file under 2MB.");
                } else if (this.title === "" || this.username === "") {
                    this.errors.push("Please enter a title and/or a username");
                } else {
                    var formData = new FormData();
                    formData.append("title", this.title);
                    formData.append("description", this.description);
                    formData.append("username", this.username);
                    formData.append("file", this.file);

                    var that = this;

                    axios
                        .post("/upload", formData)
                        .then(function (resp) {
                            /*typeof that.cuteImages);
                        data: success: false (wenn ich kein Bild hochgeladen hab)
                        data: {success: true}
                        get data & put it in an array
                        */
                            that.cuteImages.unshift(resp.data.image);
                        })
                        .catch(function (err) {
                            console.log("err from POST upload", err);
                        });
                    this.title = "";
                    this.description = "";
                    this.username = "";
                }
            },
            handleChange: function (e) {
                this.file = e.target.files[0];
            },
            handleMore: function (e) {
                e.preventDefault();
                //this.lastId
                var that = this;

                //i can use axios to make a request to server to get data
                axios
                    .get(`/more/${this.lastId}`)

                    .then(function (resp) {
                        that.cuteImages.push(...resp.data.moreImages);

                        //figuring out lastId now
                        let arr = that.cuteImages;
                        let arrLast = arr[arr.length - 1];

                        let lastId = arrLast.id;

                        that.lastId = lastId;

                        //getting the lowest id

                        if (lastId == arrLast.lowestId) {
                            that.isNight = false;
                        }
                    })
                    .catch(function (err) {
                        console.log("err in Get comments: ", err);
                    });
            },
        },
    });
})();
