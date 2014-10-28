/*

  (Early beta) jQuery UI CoverFlow 2.2 App for jQueryUI 1.8.9 / core 1.6.2
  Copyright Addy Osmani 2011.
  
  With contributions from Paul Bakhaus, Nicolas Bonnicci
  
*/
 var coverflowApp = coverflowApp || {};
 var current;
 var imgToFullScreen = false;
 var imgNo;
$(function () {

    //var coverflowApp = coverflowApp || {};

    coverflowApp = {

        defaultItem: 6,
        //default set item to be centered on
        defaultDuration: 1200,
        //animation duration
        html: $('#demo-frame div.wrapper').html(),
        imageCaption: $('.demo #imageCaption'),
        sliderCtrl: $('.demo #slider'),
        coverflowCtrl: $('.demo #coverflow'),
        coverflowImages: $('.demo #coverflow').find('img'),
        coverflowItems: $('.demo .coverflowItem'),
        sliderVertical: $(".demo #slider-vertical"),


        origSliderHeight: '',
        sliderHeight: '',
        sliderMargin: '',
        difference: '',
        proportion: '',
        handleHeight: '',

        listContent: "",


        artist: "",
        album: "",
        sortable: $('#sortable'),
        scrollPane: $('#scroll-pane'),

        setDefault: function () {
            this.defaultItem -= 1;
            $('.coverflowItem').eq(this.defaultItem).addClass('ui-selected');
        },

        setCaption: function (caption) {
            this.imageCaption.html(caption);
        },

        init_coverflow: function (elem) {

            this.setDefault();
            this.coverflowCtrl.coverflow({
                item: coverflowApp.defaultItem,
                duration: 1200,
                select: function (event, sky) {
                    coverflowApp.skipTo(sky.value);
                }
            });

            //
            this.coverflowImages.each(function (index, value) {
                var current = $(this);
                try {
                    coverflowApp.listContent += "<li class='ui-state-default coverflowItem' data-itemlink='" + (index) + "'>" + current.data('artist') + " - " + current.data('album') + "</li>";
                } catch (e) {}
            });

            //Skip all controls to the current default item
            this.coverflowItems = this.getItems();
            //this.sortable.html(this.listContent);
            this.skipTo(this.defaultItem);


            //
            this.init_slider(this.sliderCtrl, 'horizontal');
            //this.init_slider($("#slider-vertical"), 'vertical');
            //change the main div to overflow-hidden as we can use the slider now
            this.scrollPane.css('overflow', 'hidden');

            //calculate the height that the scrollbar handle should be
            this.difference = this.sortable.height() - this.scrollPane.height(); //eg it's 200px longer 
            this.proportion = this.difference / this.sortable.height(); //eg 200px/500px
            this.handleHeight = Math.round((1 - this.proportion) * this.scrollPane.height()); //set the proportional height
            ///
            this.setScrollPositions(this.defaultItem);

            //
            this.origSliderHeight = this.sliderVertical.height();
            this.sliderHeight = this.origSliderHeight - this.handleHeight;
            this.sliderMargin = (this.origSliderHeight - this.sliderHeight) * 0.5;

            //
            this.init_mousewheel();
            this.init_keyboard();
            this.sortable.selectable({
                stop: function () {
                    var result = $("#select-result").empty();
                    $(".ui-selected", this).each(function () {
                        var index = $("#sortable li").index(this);
                        coverflowApp.skipTo(index);
                    });
                }
            });


        },

        init_slider: function (elem, direction) {
            if (direction == 'horizontal') {
                elem.slider({
                    min: 0,
                    max: $('#coverflow > *').length - 1,
                    value: coverflowApp.defaultItem,
                    slide: function (event, ui) {

                        var current = $('.coverflowItem');
                        coverflowApp.coverflowCtrl.coverflow('select', ui.value, true);
                        current.removeClass('ui-selected');
                        current.eq(ui.value).addClass('ui-selected');
                        coverflowApp.setCaption(current.eq(ui.value).html());
                    }
                })
            } else {
                if (direction == 'vertical') {
                    elem.slider({
                        orientation: direction,
                        range: "max",
                        min: 0,
                        max: 100,
                        value: 0,
                        slide: function (event, ui) {
                            //console.log('aaa');
                            var topValue = -((100 - ui.value) * coverflowApp.difference / 100);
                            coverflowApp.sortable.css({
                                top: topValue
                            });
                        }
                    })
                }
            }
        },

        getItems: function () {
            var refreshedItems = $('.demo .coverflowItem');
            return refreshedItems;
        },

        skipTo: function (itemNumber) {

            var items = $('.coverflowItem');
            this.sliderCtrl.slider("option", "value", itemNumber);
            this.coverflowCtrl.coverflow('select', itemNumber, true);
            items.removeClass('ui-selected');
            items.eq(itemNumber).addClass('ui-selected');
            this.setCaption(items.eq(itemNumber).html());
        },

        init_mousewheel: function () {
            $('body').mousewheel(function (event, delta) {
                var speed = 1,
                    sliderVal = coverflowApp.sliderCtrl.slider("value"),
                    coverflowItem = 0,
                    cflowlength = $('#coverflow > *').length - 1,
                    leftValue = 0;

                //check the deltas to find out if the user has scrolled up or down 
                if (delta > 0 && sliderVal > 0) {
                    sliderVal -= 1;
                } else {
                    if (delta < 0 && sliderVal < cflowlength) {
                        sliderVal += 1;
                    }
                }

                leftValue = -((100 - sliderVal) * coverflowApp.difference / 100); //calculate the content top from the slider position
                if (leftValue > 0) leftValue = 0; //stop the content scrolling down too much
                if (Math.abs(leftValue) > coverflowApp.difference) leftValue = (-1) * coverflowApp.difference; //stop the content scrolling up beyond point desired
                coverflowItem = Math.floor(sliderVal);
                coverflowApp.skipTo(coverflowItem);

            });
        },

        init_keyboard: function () {
           // console.warn("test");
            $(document).keydown(function (e) {
                var current = coverflowApp.sliderCtrl.slider('value');
                if (e.keyCode == 37) {
                    if (current > 0) {
                        current--;
                        coverflowApp.skipTo(current);
                    }
                } else {
                    if (e.keyCode == 39) {
                        if (current < $('#coverflow > *').length - 1) {
                            current++;
                            coverflowApp.skipTo(current);
                        }
                    }
                }
                if(e.keyCode == 78) {  // up
                    toFullImg();
                }
                if((e.keyCode == 77)) {  // down
                    toThumbnail();
                }


            })
        },
        

         /*if(perspective && transition){
                path1.css(transition.css, transform.css+" 0s");
                path1.css(transform.css, "translate3d(0,"+scrPos+"px,0)");//this.scrollPosition
            }else{
                path1.clearQueue().stop().animate({top:example10.click.scrollPosition},{queue:true, duration:0, specialEasing: {top:bez}});
            }*/

        generateList: function () {
            this.coverflowImages.each(function (index, value) {
                var t = $(this);
                try {
                    listContent += "<li class='ui-state-default coverflowItem' data-itemlink='" + (index) + "'>" + t.data('artist') + " - " + t.data('album') + "</li>";
                } catch (e) {}
            })
        },


        setScrollPositions: function () {
            $('#slider-vertical').slider('value', this.item * 5);
            this.sortable.css('top', -this.item * 5 + -35);
        },

        handleScrollpane: function () {
            this.scrollPane.css('overflow', 'hidden');

            //calculate the height that the scrollbar handle should be
            difference = this.sortable.height() - this.scrollPane.height(); //eg it's 200px longer 
            proportion = difference / this.sortable.height(); //eg 200px/500px
            handleHeight = Math.round((1 - proportion) * this.scrollPane.height()); //set the proportional height
        }
    };


    coverflowApp.init_coverflow();

//console.warn("screen Width: "+window.screen.width);

});

function toFullImg() {
    //console.warn("to full img");
    var imgEle = $("#img" + current);
    var s0 = imgEle.html();
    //console.warn(imgEle.attr("src"));
    var imgSrc = imgEle.attr("src");
    imgSrc = imgSrc.replace("thumbnails","originalImages");
    //console.warn(imgSrc);
    
    imgEle.html('<a href="'+imgSrc+'" data-lightbox="image-'+current+'" data-title="'+imgEle.attr("data-album")+'"><div style="float:left" id="href_div'+current+'"></div></a>');
    $("#href_div"+current).click();
    imgToFullScreen = true;
    imgNo = current;
}
function toThumbnail() {
    if(!imgToFullScreen){return;}
    $("#lightbox").click();
    $("#img" + imgNo).html("");
    imgToFullScreen = false;
}
  var state = 10;
       $(document).mousemove(function(e){
            if(imgToFullScreen){return;}
            var scrPos = e.pageX;///10.588;
            var grid = window.screen.width/20;
           // console.warn(scrPos);

           // $("#cordi_id").text(e.pageX/10.588 + ", " + e.pageY);
            //path1.addClass("active");
            //var coverflowApp = coverflowApp || {};
                 current = coverflowApp.sliderCtrl.slider('value');
              

                if (scrPos < grid && scrPos > 0) {
                    if(state > 0) {
                        if (current > 0) {
                            state = 0;
                            current--;
                            coverflowApp.skipTo(current);
                        }
                    }
                    
                } 
                else if (scrPos < 2*grid && scrPos >= grid) {
                    if(state > 1) {
                        if (current > 0) {
                            state = 1;
                            current--;
                            coverflowApp.skipTo(current);
                        }   
                    }
                    if(state = 0) {
                        state = 1;
                    }
                } 
                else if (scrPos < 3*grid && scrPos >= 2*grid) {
                    if(state > 2) {
                        if (current > 0) {
                            state = 2;
                            current--;
                            coverflowApp.skipTo(current);
                        }
                    }
                    if(state < 2) {
                        state = 2;
                    }
                } 
                else if (scrPos < 4*grid && scrPos >= 3*grid) {
                    //console.warn("grid3-4");
                    if(state > 3) {
                        //console.warn("grid3-4");
                        //console.warn("state: " + state);
                        if (current > 0) {
                            state = 3;
                            current--;
                            coverflowApp.skipTo(current);
                        }
                    }
                    if(state < 3) {
                        state = 3;
                    }
                } 
                else if (scrPos < 5*grid && scrPos >= 4*grid) {
                    //console.warn("grid3-4");
                    if(state > 4) {
                        //console.warn("grid3-4");
                        //console.warn("state: " + state);
                        if (current > 0) {
                            state = 4;
                            current--;
                            coverflowApp.skipTo(current);
                        }
                    }
                    if(state < 4) {
                        state = 4;
                    }
                } 
                else if (scrPos < 6*grid && scrPos >= 5*grid) {
                    //console.warn("grid3-4");
                    if(state > 5) {
                        //console.warn("grid3-4");
                       // console.warn("state: " + state);
                        if (current > 0) {
                            state = 5;
                            current--;
                            coverflowApp.skipTo(current);
                        }
                    }
                    if(state < 5) {
                        state = 5;
                    }
                } 
                else if (scrPos < 7*grid && scrPos >= 6*grid) {
                    //console.warn("grid3-4");
                    if(state > 6) {
                       // console.warn("grid3-4");
                       // console.warn("state: " + state);
                        if (current > 0) {
                            state = 6;
                            current--;
                            coverflowApp.skipTo(current);
                        }
                    }
                    if(state < 6) {
                        state = 6;
                    }
                } 
                else if (scrPos < 8*grid && scrPos >= 7*grid) {
                    //console.warn("grid3-4");
                    if(state > 7) {
                       // console.warn("grid3-4");
                       // console.warn("state: " + state);
                        if (current > 0) {
                            state = 7;
                            current--;
                            coverflowApp.skipTo(current);
                        }
                    }
                    if(state < 7) {
                        state = 7;
                    }
                } 
//**************************************************************
                else if (scrPos < 12*grid && scrPos >= 8*grid) {
                    state = 10;
                } 
 //**************************************************************        
                else if (scrPos < 13*grid && scrPos >= 12*grid) {
                    //console.warn("grid3-4");
                    if(state < 12) {
                        //console.warn("grid3-4");
                       // console.warn("state: " + state);
                        if (current < $('#coverflow > *').length - 1) {
                            state = 12;
                            current++;
                            coverflowApp.skipTo(current);
                        }
                    }
                    if(state > 12) {
                        state = 12;
                    }
                }      
                else if (scrPos < 14*grid && scrPos >= 13*grid) {
                    //console.warn("grid3-4");
                    if(state < 13) {
                       // console.warn("grid3-4");
                      //  console.warn("state: " + state);
                        if (current < $('#coverflow > *').length - 1) {
                            state = 13;
                            current++;
                            coverflowApp.skipTo(current);
                        }
                    }
                    if(state > 13) {
                        state = 13;
                    }
                } 
                else if (scrPos < 15*grid && scrPos >= 14*grid) {
                    //console.warn("grid3-4");
                    if(state < 14) {
                      //  console.warn("grid3-4");
                       // console.warn("state: " + state);
                        if (current < $('#coverflow > *').length - 1) {
                            state = 14;
                            current++;
                            coverflowApp.skipTo(current);
                        }
                    }
                    if(state > 14) {
                        state = 14;
                    }
                } 
                else if (scrPos < 16*grid && scrPos >= 15*grid) {
                    //console.warn("grid3-4");
                    if(state < 15) {
                       // console.warn("grid3-4");
                      //  console.warn("state: " + state);
                        if (current < $('#coverflow > *').length - 1) {
                            state = 15;
                            current++;
                            coverflowApp.skipTo(current);
                        }
                    }
                    if(state > 15) {
                        state = 15;
                    }
                } 
                else if (scrPos < 17*grid && scrPos >= 16*grid) {
                    //console.warn("grid3-4");
                    if(state < 16) {
                       // console.warn("grid3-4");
                       // console.warn("state: " + state);
                        if (current < $('#coverflow > *').length - 1) {
                            state = 16;
                            current++;
                            coverflowApp.skipTo(current);
                        }
                    }
                    if(state > 16) {
                        state = 16;
                    }
                } 
                else if (scrPos < 18*grid && scrPos >= 17*grid) {
                    //console.warn("grid3-4");
                    if(state < 17) {
                       // console.warn("grid3-4");
                       // console.warn("state: " + state);
                        if (current < $('#coverflow > *').length - 1) {
                            state = 17;
                            current++;
                            coverflowApp.skipTo(current);
                        }
                    }
                    if(state > 17) {
                        state = 17;
                    }
                } 
                else if (scrPos < 19*grid && scrPos >= 18*grid) {
                    //console.warn("grid3-4");
                    if(state < 18) {
                       // console.warn("grid3-4");
                       // console.warn("state: " + state);
                        if (current < $('#coverflow > *').length - 1) {
                            state = 18;
                            current++;
                            coverflowApp.skipTo(current);
                        }
                    }
                    if(state > 18) {
                        state = 18;
                    }
                } 
                else if (scrPos < 20*grid && scrPos >= 19*grid) {
                    //console.warn("grid3-4");
                    if(state < 19) {
                       // console.warn("grid3-4");
                       // console.warn("state: " + state);
                        if (current < $('#coverflow > *').length - 1) {
                            state = 19;
                            current++;
                            coverflowApp.skipTo(current);
                        }
                    }
                    if(state > 19) {
                        state = 19;
                    }
                }   
                else {}

                /*else {
                    if (scrPos < 110 && scrPos > 100) {
                        if (current < $('#coverflow > *').length - 1) {
                            current++;
                            coverflowApp.skipTo(current);
                        }
                    }
                }*/
           
        }) 