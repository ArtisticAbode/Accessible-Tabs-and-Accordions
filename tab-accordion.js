/*
USAGE: Make sure to call this in the ready and resize events. If you change the JS breakpoint, be sure to change the CSS media query breakpoint as well.

if ($('.accordion').length > 0) {
    $('body').tabAccordion({
        breakpoint: 1000 
    });
}
*/

(function($) {
    'use strict';
    var visited = false;
    $.fn.tabAccordion = function(options) {
        options = $.extend({
            breakpoint : 1000,  //if not otherwise specified, the breakpoint to make tabs into accordions is 1000px
            windowSize : Math.max($(window).width(), window.innerWidth)
        }, options);        
 
        if ($('.accordion').length && !visited) { //don't want to call this on resize
            /* set up aria roles */
            var accordionCount = 0;
            $('.accordion > .toggle').each(function () {
                accordionCount++;
                var toggleText = $(this).text();
                $(this).next('.content').attr({'aria-expanded':'false', 'aria-hidden':'true', 'aria-labelledby':'accordion-' + accordionCount, 'id':'accordion-tab-' + accordionCount}).wrapInner('<div class="padding"></div>');
                $(this).html('<span class="heading" aria-hidden="true">' + toggleText + '</span><button class="toggle" aria-expanded="false" aria-controls="accordion-tab-' + accordionCount + '" id="accordion-' + accordionCount + '" type="button">' + toggleText + '</button>');
            });

            $('.accordion').each(function () {
                $(this).addClass('js');
                accordionOpen();
                keyboardLoop(this);
            });
			$('.accordion.always > .toggle, .accordion.multi > .toggle, .accordion.small-only > .toggle').each(function(){
				  var $this = $(this);
				  $this.add($this.nextUntil('.toggle', '.content')).wrapAll('<div class="listitem" role="listitem"></div>');
			});
			$('.accordion.always, .accordion.small-only').each(function() {
				$(this).attr('role', 'list');
				$(this).find('> .listitem > .content').hide();
			});
			$('.accordion.tabs > .toggle').each(function(){
				  var $this = $(this);
				  $this.add($this.nextUntil('.toggle', '.content')).wrapAll('<div class="listitem"></div>');
			});

            /* show/hide mouse functionality */
            $('.accordion:not(.multi) > .listitem > .toggle > button.toggle').click(function () {
                var activeTab = $(this).attr('id');
				//alert(activeTab);
                if ($(this).attr('aria-expanded') === 'true') {
                    //alert('not multi true');
					$(this).attr('aria-expanded', 'false');
                    $('[aria-labelledby="' + activeTab + '"]').attr({'aria-hidden':'true', 'aria-expanded':'false'}).slideToggle(400, function() {
						// Done
					});
                } else {
					//alert('not multi false');
                    $(this).closest('.accordion').find('> .listitem > .toggle > button.toggle').attr('aria-expanded', 'false');
                    $(this).closest('.accordion').find('> .listitem > .content').attr({'aria-hidden':'true', 'aria-expanded':'false'}).hide();
                    $(this).attr('aria-expanded', 'true');
                    $('[aria-labelledby="' + activeTab + '"]').attr({'aria-hidden':'false', 'aria-expanded':'true'}).slideToggle(400, function() {
						// Done
					});
                }
                return false;
            });

            accordionMulti();

            /* show/hide keyboard functionality */
            $('.accordion > .listitem > .toggle > button.toggle').keydown(function (e) {
                keyboardFunctionality(e, this);
            });
            visited = true; //ensure this doesn't get called on resize
        }
        
        accordionTabs();
		accordionSmall();
		accordionOpen();
    
        function accordionMulti() { 
            $('.accordion.multi').each(function() {
				$(this).attr('role', 'list');
				$(this).find('> .listitem > .toggle > button.toggle');
                $(this).find('> .listitem > .content').attr('role', 'listitem').hide();
            });
            /* show/hide mouse functionality */
            $('.accordion.multi > .listitem > .toggle > button.toggle').click(function () {
                var activeTab = $(this).attr('id');
                if ($(this).attr('aria-expanded') === 'true') {
					//alert('multi true');
                    $(this).attr('aria-expanded', 'false');
                    $('[aria-labelledby="' + activeTab + '"]').attr({'aria-hidden':'true', 'aria-expanded':'false'}).slideToggle(400, function() {
						// Done
					});
                } else {
					//alert('multi false');
                    $(this).attr('aria-expanded', 'true');
                    $('[aria-labelledby="' + activeTab + '"]').attr({'aria-hidden':'false', 'aria-expanded':'true'}).slideToggle(400, function() {
						// Done
					});
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
                        $(this).removeClass('js').removeAttr('role');
						$(this).find('> .listitem').removeAttr('role');
                        $(this).find('> .listitem > .toggle > button.toggle').removeAttr('role').removeAttr('aria-expanded');
                        $(this).find('> .listitem > .toggle > .heading').removeAttr('aria-hidden');
						$(this).find('> .listitem > .content').removeAttr('role').removeAttr('aria-expanded').removeAttr('aria-hidden').show();
                    });
                } else {
                    // small screen accordion
                    $('.accordion.small-only').each(function () {
                        // if in plain text format, convert into accordion
                        if (!$(this).hasClass('js')) {
                            //console.log('add accordion');	
                            $(this).addClass('js').attr('role', 'list');
							$(this).find('> .listitem').attr('role', 'listitem');
                            $(this).find('> .listitem > .toggle > button.toggle').attr({'aria-expanded':'false'});
							$(this).find('> .listitem > .toggle > .heading').attr('aria-hidden', 'true');
                            $(this).find('> .listitem > .content').attr({'aria-expanded':'false', 'aria-hidden':'true'}).hide();
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
						$(this).attr({'role':'tablist'});
						$(this).find('> .listitem').removeAttr('role');
                        // if in accordion format, convert into tabs
                        if ($(this).find('> ul.tablist').length === 0) {
                            //console.log('add tabs');
                            $(this).removeAttr('role');
                            //build tab list controls
                            if ($(this).find('ul.tablist').length) {
                                //tab list already exists
                                $(this).find('ul.tablist').show();
                            } else {
								//create tab list
                                $(this).prepend('<ul class="tablist" role="tablist"></ul>');
                                $(this).find('> .listitem > .toggle').each(function () {
                                    var toggle = $(this).html();
									$(toggle).appendTo($(this).closest('.accordion.tabs').find('.tablist')).wrap('<li role="presentation" />');
                                });
								$('.accordion.tabs').find('> .tablist > li > .heading').parent().remove();
								$(this).find('> .listitem > .toggle').hide();
                            }  
                        }
						
						// close all tabs except first
						$(this).find('> .listitem > .content').attr({'aria-expanded':'false', 'aria-hidden':'true', 'role':'tabpanel'}).hide();
						$(this).find('> .listitem > .content:first').attr({'aria-expanded':'true', 'aria-hidden':'false'}).show();
						$(this).find('> .tablist > li > button.toggle').attr({'aria-expanded':'false', 'role':'tab'});
						$(this).find('> .tablist > li:first-child > button.toggle').attr('aria-expanded', 'true');						

                        $(this).find('> ul.tablist li:first button.toggle').keydown(function (e) {
                            if (e.altKey) {
                                // do nothing
                                return true;
                            // keyboard loop to end if on first
                            } else if ((e.which === 37) || (e.which === 38)) {
                                //console.log('prev');
                                $(this).parents().nextAll('li').find('button.toggle').focus().click();
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
                                $(this).closest('ul.tablist').find('li:first button.toggle').focus().click();
                                return false;
                            }
                        });
                    }); /* end accordion each */

                    /* show/hide mouse functionality */
                    $('.accordion.tabs > .tablist button.toggle').click(function () {
                        if ($(this).attr('aria-expanded') === 'true') {
                            // tab already selected, do nothing;
                        } else {
                            var activeTab = $(this).attr('id');
                            $(this).closest('.accordion.tabs').find('li button.toggle').attr({'aria-expanded':'false'});
                            $(this).attr({'aria-expanded':'true'});
                            $(this).closest('.accordion.tabs').find('> .listitem > .content').attr({'aria-expanded':'false', 'aria-hidden':'true'}).hide();
                            $('[aria-labelledby="' + activeTab + '"]').attr({'aria-hidden':'false', 'aria-expanded':'true'}).show();
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
                            $(this).parents().prev('li').find('button.toggle').focus().click();
                            return false;
							// arrow down or right
                        } else if ((e.which === 39) || (e.which === 40)) {
                            //console.log('next');
                            $(this).parents().next('li').find('button.toggle').focus().click();
                            return false;
                        }
                    });

                } else {
                    // small screen accordion
                    $('.accordion.tabs').each(function () {
                        // if in tabs format, convert into accordion		
                        //if ($(this).find('> ul.tablist').length) {
                            //console.log('remove tabs');		
                            $(this).attr('role', 'list');
							$(this).find('> .listitem').attr('role', 'listitem');
                            $(this).find('> .listitem > .content').attr({'aria-expanded':'false', 'aria-hidden':'true'}).removeAttr('role').hide();
                            $(this).find('> .listitem > .toggle > button.toggle').attr('aria-expanded', 'false');
                            $(this).find('> ul.tablist').remove();
							$(this).find('> .listitem > .toggle').show();

                            keyboardLoop(this);

                            /* show/hide keyboard functionality */
                            $('.accordion.tabs > .listitem > .toggle > button.toggle').keydown(function (e) {
                                keyboardFunctionality(e, this);
                            });
						
                        //}
                    }); /* end accordion.tab each */
                }
            }
        }

        function accordionOpen() { 
            if ($('.accordion > .listitem > .toggle.open').length) {
                $('.accordion > .listitem > .toggle.open').each(function () {
                    var activeTab = $(this).find('button.toggle').attr('id');
                    $(this).find('button.toggle').attr('aria-expanded', 'true');
                    $('[aria-labelledby="' + activeTab + '"]').attr({'aria-hidden':'false', 'aria-expanded':'true'}).show();
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
      uniqueId = "Don't call this twice without a uniqueId";
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
			//horizontal resize
			$('body').tabAccordion();
		} else {
			//vertical resize
		}
    }, 250, "some unique string");
});
