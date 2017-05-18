/*
MIT License

Copyright 2017 Artistic Abode

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

(function($) {
    'use strict';
    var visited = false;
    $.fn.tabAccordion = function(options) {
        options = $.extend({
            breakpoint : 700,  // the default breakpoint in pixels
            windowSize : Math.max($(window).width(), window.innerWidth)
        }, options);        
 
        if ($('.accordion').length && !visited) { // don't call this on resize
            /* set up aria roles */
            var accordionCount = 0;
            $('.accordion > .toggle').each(function () {
                accordionCount++;
                var toggleText = $(this).text();
                $(this).next('.content').attr({'role':'tabpanel', 'aria-expanded':'false', 'aria-hidden':'true', 'aria-labelledby':'accordion-' + accordionCount, 'id':'accordion-tab-' + accordionCount});
                $(this).after('<button class="toggle" role="tab" aria-selected="false" aria-controls="accordion-tab-' + accordionCount + '" id="accordion-' + accordionCount + '" type="button">' + toggleText + '</button>');
            });

            $('.accordion').each(function () {
                $(this).addClass('js').attr('role', 'tablist');
                $(this).find('button.toggle:first');
                accordionOpen();

                keyboardLoop(this);
            });

            /* show/hide mouse functionality */
            $('.accordion:not(.multi) > button.toggle').click(function () {
                var activeTab = $(this).attr('id');
                if ($(this).attr('aria-selected') === 'true') {
                    //alert('not multi true');
					$(this).attr('aria-selected', 'false');
                    $('[aria-labelledby="' + activeTab + '"]').attr({'aria-hidden':'true', 'aria-expanded':'false'});
                } else {
					//alert('not multi false');
                    $(this).closest('.accordion').find('> button.toggle').attr('aria-selected', 'false');
                    $(this).closest('.accordion').find('> .content').attr({'aria-hidden':'true', 'aria-expanded':'false'});
                    $(this).attr('aria-selected', 'true');
                    $('[aria-labelledby="' + activeTab + '"]').attr({'aria-hidden':'false', 'aria-expanded':'true'}).attr("tabindex", "-1").focus();
                }
                return false;
            });

            accordionMulti();

            /* show/hide keyboard functionality */
            $('.accordion button.toggle').keydown(function (e) {
                keyboardFunctionality(e, this);
            });
            visited = true; //ensure this doesn't get called on resize
        }  
		
        accordionTabs();
		accordionSmall();
    
        function accordionMulti() { 
            $('.accordion.multi').each(function() {
                $(this).attr('aria-multiselectable', 'true');
				$(this).removeAttr('role', 'tablist');
				$(this).find('.toggle').addClass('sr-only');
				$(this).find('> button.toggle').removeAttr('role', 'tab').removeClass('sr-only');
                $(this).find('> .content').removeAttr('role', 'tabpanel');
            });
            /* show/hide mouse functionality */
            $('.accordion.multi > button.toggle').click(function () {
                var activeTab = $(this).attr('id');
                if ($(this).attr('aria-selected') === 'true') {
					//alert('multi true');
                    $(this).attr('aria-selected', 'false');
                    $('[aria-labelledby="' + activeTab + '"]').attr({'aria-hidden':'true', 'aria-expanded':'false'});
                } else {
					//alert('multi false');
                    $(this).attr('aria-selected', 'true');
                    $('[aria-labelledby="' + activeTab + '"]').attr({'aria-hidden':'false', 'aria-expanded':'true'}).attr("tabindex", "-1").focus();
                }
                return false;
            });
        }

        function accordionSmall() {
            if ($('.accordion.small-only').length) {
                if (options.windowSize >= options.breakpoint) {
                    // large screen show plain text
                    $('.accordion.small-only').each(function () {
                        //console.log('remove accordion');
                        $(this).removeClass('js').removeAttr('role').removeAttr('aria-multiselectable');
                        $(this).find('> button.toggle').removeAttr('tabindex').removeAttr('role').removeAttr('aria-selected');
                        $(this).find('> .content').removeAttr('role').removeAttr('aria-expanded').removeAttr('aria-hidden');
                    });
                } else {
                    // small screen accordion
                    $('.accordion.small-only').each(function () {
                        // if in plain text format, convert into accordion
                        if (!$(this).hasClass('js')) {
                            //console.log('add accordion');	
                            $(this).addClass('js').attr({'role':'tablist', 'aria-multiselectable':'true'});
                            $(this).find('> button.toggle').attr({/*'tabindex':'-1', */'role':'tab', 'aria-selected':'false'}).css('display', '');
                            $(this).find('> button.toggle:first');
                            $(this).find('> .content').attr({'role':'tabpanel', 'aria-expanded':'false', 'aria-hidden':'true'});
                            accordionOpen();
                        }
                    });
                }
            }
        }

        function accordionTabs() {
            if ($('.accordion.tabs').length) {
                if (options.windowSize >= options.breakpoint) {
                    // large screen tabs
                    $('.accordion.tabs').each(function () {
                        // if in accordion format, convert into tabs
                        if ($(this).find('> ul.tablist').length === 0) {
                            //console.log('add tabs');
                            $(this).removeAttr('role').removeAttr('aria-multiselectable');
                            //build tab list controls
                            if ($(this).find('ul.tablist').length) {
                                //tab list already exists
                                $(this).find('ul.tablist').css('display', 'block').css('visibility', 'visible');
                                $(this).find('ul.tablist button.toggle').removeAttr('style');
                            } else {
                                $(this).prepend('<ul class="tablist" role="tablist"></ul>');
                                $(this).find('> button.toggle').each(function () {
                                    var toggle = $('<div />').append($(this).clone()).html();
                                    $(toggle).appendTo($(this).prevAll('.tablist')).wrap('<li role="presentation" />');
                                    $(this).remove();
                                });
                            }

                            // close all tabs except first
                            $(this).find('ul.tablist button.toggle').removeAttr('style');
                            $(this).find('> .content').attr({'aria-expanded':'false', 'aria-hidden':'true'});
                            $(this).find('> .content:first').attr({'aria-expanded':'true', 'aria-hidden':'false'});
                            $(this).find('.tablist button.toggle').attr('aria-selected', 'false');
                            $(this).find('.tablist li:first-child button.toggle').attr('aria-selected', 'true');
                        } 

                        $(this).find('> ul.tablist li:first button.toggle').keydown(function (e) {
                            if (e.altKey) {
                                // do nothing
                                return true;
                            // keyboard loop to end if on first
                            } else if ((e.which === 37) || (e.which === 38)) {
                                //console.log('prev');
                                $(this).parents().nextAll('li').find('button.toggle').focus();
                                return false;
                            }
                        });

                        $(this).find('> ul.tablist li:last button.toggle').keydown(function (e) {
                            if (e.altKey) {
                                // do nothing
                                return true;
                            // keyboard loop to top if on last
                            } else if ((e.which === 39) || (e.which === 40)) {
                                //console.log('next');
                                $(this).closest('ul.tablist').find('li:first button.toggle').focus();
                                return false;
                            }
                        });
                    }); /* end accordion each */

                    /* show/hide mouse functionality */
                    $('.accordion.tabs > .tablist button.toggle').click(function () {
                        if ($(this).attr('aria-selected') === 'true') {
                            // tab already selected, do nothing;
							//alert('tab true');
                        } else {
							//alert('tab false');
                            var activeTab = $(this).attr('id');
                            $(this).closest('.accordion.tabs').find('li button.toggle').attr({'aria-selected':'false'/*, 'tabindex':'-1'*/});
                            $(this).attr({'aria-selected':'true'});
                            $(this).closest('.accordion.tabs').find('> .content').attr({'aria-expanded':'false', 'aria-hidden':'true'});
                            $('[aria-labelledby="' + activeTab + '"]').attr({'aria-hidden':'false', 'aria-expanded':'true'}).attr("tabindex", "-1").focus();
                        }
                        return false;
                    });

                    /* show/hide keyboard functionality */
                    $('.accordion.tabs > .tablist button.toggle').keydown(function (e) {
                        // enter or space
                        if ((e.which === 13) || (e.which === 32)) {
                            $(this).click();
                            return false;
                        } else if (e.altKey) {
                            // do nothing
                            return true;
                        // arrow up or left
                        } else if ((e.which === 37) || (e.which === 38)) {
                            //console.log('prev');
                            //$(this).attr('tabindex', '-1');
                            $(this).parents().prev('li').find('button.toggle').focus();
                            return false;
                        // arrow down or right
                        } else if ((e.which === 39) || (e.which === 40)) {
                            //console.log('next');
                            //$(this).attr('tabindex', '-1');
                            $(this).parents().next('li').find('button.toggle').focus();
                            return false;
                        }
                    });

                } else {
                    // small screen accordion
                    $('.accordion.tabs').each(function () {
                        // if in tabs format, convert into accordion		
                        if ($(this).find('> ul.tablist').length) {
                            //console.log('remove tabs');		
                            $(this).attr({'role':'tablist', 'aria-multiselectable':'true'});
                            $(this).find('> .content').attr({'aria-expanded':'false', 'aria-hidden':'true'});

                            $(this).find('> ul.tablist li button.toggle').each(function () {
                                //move buttons from tablist to accordion position
                                var tabNumber = $(this).attr('id');
                                var movedBtn = $('<div />').append($(this).clone()).html();
                                $(movedBtn).insertBefore($(this).closest('.accordion.tabs').find('.content[aria-labelledby=' + tabNumber + ']'));
                            });

                            $(this).find('> button.toggle').attr('aria-selected', 'false');
                            $(this).find('> ul.tablist').remove();

                            keyboardLoop(this);

                            /* show/hide mouse functionality */
                            $(this).find('> button.toggle').click(function () {
                                var activeTab = $(this).attr('id');
                                if ($(this).attr('aria-selected') === 'true') {
                                    //alert('resized tab true');
									$(this).attr('aria-selected', 'false');
                                    $('[aria-labelledby="' + activeTab + '"]').attr({'aria-hidden':'true', 'aria-expanded':'false'});
                                } else {
									//alert('resized tab false');
                                    $(this).attr('aria-selected', 'true');
                                    $('[aria-labelledby="' + activeTab + '"]').attr({'aria-hidden':'false', 'aria-expanded':'true'}).attr("tabindex", "-1").focus();
                                }
                                return false;
                            });

                            /* show/hide keyboard functionality */
                            $('.accordion.tabs > button.toggle').keydown(function (e) {
                                keyboardFunctionality(e, this);
                            });
						
                        }
                    }); /* end accordion.tab each */
                }
            }
            accordionOpen();
        }

        function accordionOpen() { 
            if ($('.accordion > .toggle.open').length) {
                $('.accordion > .toggle.open').each(function () {
                    var activeTab = $(this).next('button.toggle').attr('id');
                    $(this).next('button.toggle').attr('aria-selected', 'true');
                    $('[aria-labelledby="' + activeTab + '"]').attr({'aria-hidden':'false', 'aria-expanded':'true'});
                });
            }
        }

        function keyboardLoop(el) {
            $(el).find('> button.toggle:first').keydown(function (e) {
                if (e.altKey) {
                    // do nothing
                    return true;
                // keyboard loop to end if on first
                } else if ((e.which === 37) || (e.which === 38)) {
                    //console.log('prev');
                    $(this).nextAll('button.toggle:last').focus();
                    return false;
                }
            });

            $(el).find('> button.toggle:last').keydown(function (e) {
                if (e.altKey) {
                    // do nothing
                    return true;
                // keyboard loop to top if on last
                } else if ((e.which === 39) || (e.which === 40)) {
                    //console.log('next');
                    $(this).prevAll('button.toggle').focus();
                    return false;
                }
            });
        }

        function keyboardFunctionality(e, el) {
            // enter or space
            if ((e.which === 13) || (e.which === 32)) {
                $(e).click();
                return false;
            } else if (e.altKey) {
                // do nothing
                return true;
            // arrow up or left
            } else if ((e.which === 37) || (e.which === 38)) {
                //console.log('prev');
                $(el).prevAll('button.toggle:first').focus();
                e.preventDefault();
            // arrow down or right
            } else if ((e.which === 39) || (e.which === 40)) {
                //console.log('next');
                $(el).nextAll('button.toggle:first').focus();
                e.preventDefault();
            }
        }
    };
}(jQuery));

$(document).ready(function() {
    'use strict';
    $('body').tabAccordion();
});

var waitForFinalEvent = (function () {
  var timers = {};
  return function (callback, ms, uniqueId) {
    if (!uniqueId) {
      uniqueId = "tabAccordion";
    }
    if (timers[uniqueId]) {
      clearTimeout (timers[uniqueId]);
    }
    timers[uniqueId] = setTimeout(callback, ms);
  };
})();

var width = $(window).width();
$(window).resize(function () {
	'use strict';
    waitForFinalEvent(function(){
		if($(this).width() != width) {
			width = $(this).width();
			$('body').tabAccordion();
		} else {
			// do nothing on height resize
		}
    }, 250, "tabAccordion");
});