/*
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function(b,c){var $=b.jQuery||b.Cowboy||(b.Cowboy={}),a;$.throttle=a=function(e,f,j,i){var h,d=0;if(typeof f!=="boolean"){i=j;j=f;f=c}function g(){var o=this,m=+new Date()-d,n=arguments;function l(){d=+new Date();j.apply(o,n)}function k(){h=c}if(i&&!h){l()}h&&clearTimeout(h);if(i===c&&m>e){l()}else{if(f!==true){h=setTimeout(i?k:l,i===c?e-m:e)}}}if($.guid){g.guid=j.guid=j.guid||$.guid++}return g};$.debounce=function(d,e,f){return f===c?a(d,e,false):a(d,f,e!==false)}})(this);

$(window).load(function() {

  //
  //
  //  Start loading videos
  //
  //
  setTimeout(function() {
    $('video').prop('preload', 'auto').trigger('pause');
  }, 100);

});

$(function() {

  //
  //
  //  Back to main index
  //
  //

  // Inject the back link manually to prevent unnecessary HTML cruft
  $('body').prepend('<div class="back-holder"><a href="#" class="back">&larr;</a></div>');

  var scrollTo = false;
  $('.wrapper, .back-holder').on('click', function(e) {

    // If there are no open projects, do nothing
    if (!$('body').is('.open-project')) return;

    // Scroll back to original page position
    $('html, body').scrollTop(scrollTo);

    // Close open project
    $('body').removeClass('open-project');
    $('.project').removeClass('active-project');
    document.location.hash = '/';

    // Pause all videos
    $('body').removeClass('play-videos');
    $('.project video').trigger('pause');
  });


  //
  //
  //  Project navigation
  //
  //

  var scrollIntoView = function(active) {
    if (active.offset().top < $(window).scrollTop()
        || active.offset().top > $(window).scrollTop() + $(window).height() * 0.6) {
      setTimeout(function() {
        $('html, body').scrollTop(active.offset().top - 100);
      }, 1);
    }
  }

  $('a.next').on('click', function() {
    $(this).addClass('next-out').one('transitionend webkitTransitionEnd mozTransitionEnd oTransitionEnd', function(){
      $(this).removeClass('next-out');
    });
    var active = $(this.href.replace(/^.*#/, '#'));
    active.addClass('next-in').one('transitionend webkitTransitionEnd mozTransitionEnd oTransitionEnd', function(){
      $(this).removeClass('next-in');
    });
    $('html, body').animate({ scrollTop: 0 }, 400);
  });

  $('a[href^=#project]').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    // Close the main page
    $('.project').removeClass('active-project');

    // Pause any videos in open projects
    $('.active-project video', this.parentNode).each(function() {
      this.pause();
    });

    // Find the targeted project
    var active = $(this.href.replace(/^.*#/, '#')).addClass('active-project');

    // Scroll into the project if necessary
    scrollIntoView(active);
    document.location.hash = this.href.replace(/^.*#/, '/');

    // Set the page scroll position
    if (!$('body').is('.open-project')) scrollTo = $(window).scrollTop();

    // Close the main page
    $('body').addClass('open-project');

    // Start the videos once the animation has finished
    $('.wrapper').one('transitionend webkitTransitionEnd mozTransitionEnd oTransitionEnd', function() {
      // Fade in videos
      setTimeout(function() {
        $('body').addClass('play-videos');
        // Autoplay any videos on screen
        $(window).trigger('projectOpened');
      }, 200);
    });
  });

  $('.project').on('click', function(e) {
    // Prevent clicking on an open project from closing itself
    if (!$(e.target).is('a')) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      e.stopPropagation();
    }
  });


  //
  //
  //  Hashchange tracking
  //
  //

  $(window).on('hashchange', function() {
    var target = $(document.location.hash.replace(/\//, '')).prev('p').find('a');
    if (!target.length) target = $('.back');
    target.click();
  }).trigger('hashchange');


  //
  //
  //  Videos
  //
  //

  $('video').each(function() {
    // Inject the restart-video buttons
    var wrapper = $(this).parent();
    $('<button class="restart-video">⇤</button>').appendTo(wrapper);
  });

  $('.restart-video').on('click', function() {
    var video = $('video', this.parentNode)
    // Restart the video
    video.get(0).currentTime = 0;
    // play the bounce animation
    video.parent().addClass('bounce').one('transitionend webkitTransitionEnd mozTransitionEnd oTransitionEnd', function() {
      video.parent().removeClass('bounce');
    });
  });

  var visibleVideo = function(video) {
    return video.offset().top > $(window).scrollTop() - $(window).height() * 0.1 &&
           video.offset().top < $(window).scrollTop() + $(window).height() * 0.7
  }

  // Only play videos when they are visible on the screen
  $(window).on('scroll projectOpened', $.debounce( 250, function() {
    $('video').each(function() {
      var video = $(this);
      if (video.is(':visible') && video.parent().parent().height() > 10) {
        if (visibleVideo(video)) {
          // Start playing
          video.addClass('playing');
          video.get(0).play();
        } else {
          // Stop playing
          video.removeClass('playing');
          video.get(0).pause();
        }
      }
    });
  } ) ).scroll();

  // Fix an iOS HTML5 video bug
  if(/(iPhone|iP[oa]d)/.test(navigator.userAgent)) {
    $('video').each(function() {
      $(this).prop('controls', true).css({ width: "100%", height: "10em" });
    });
  }

});
