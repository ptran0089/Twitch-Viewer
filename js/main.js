'use strict';

(function() {
  let streams;

  const app = {
    init() {
      streams = JSON.parse(localStorage.getItem('streams')) || [];
      for (let i = 0; i < streams.length; i++) {
        const streamName = streams[i];
        app.findStream(streamName);
      }
      view.init();
    },

    loadSamples() {
      if (streams.indexOf('esl_sc2') === -1) {
        app.findStream('esl_sc2');
      }
      if (streams.indexOf('freecodecamp') === -1) {
        app.findStream('freecodecamp');
      }
      if (streams.indexOf('pokemon') === -1) {
        app.findStream('pokemon');
      }
    },

    findStream(streamName) {
      const url = 'https://www.twitch.tv/' + streamName;
      $.ajax({
        method: 'GET',
        dataType: 'jsonp',
        url: 'https://wind-bow.gomix.me/twitch-api/streams/' + streamName,
        success: function(response) {
          if (response.stream) {
            app.saveStream(streamName);
            view.addStream(response, streamName, url, 'online');
          } else {
            // If stream is offline, make request to channel to get stream info
            $.ajax({
              method: 'GET',
              dataType: 'jsonp',
              url: 'https://wind-bow.gomix.me/twitch-api/users/' + streamName,
              success: function(response) {
                if (response.error) {
                  view.warning("Channel not found");
                  return;
                }
                app.saveStream(streamName);
                view.addStream(response, streamName, url, 'offline');
              }
            });
          }
        }
      });
    },

    saveStream(streamName) {
      // Prevent duplication of streams every time findStream is called
      if (streams.indexOf(streamName) === -1) {
        streams.push(streamName);
        localStorage.setItem('streams', JSON.stringify(streams));
      }
    },

    deleteStream(streamName) {
      const index = streams.indexOf(streamName);

      streams.splice(index, 1);
      localStorage.setItem('streams', JSON.stringify(streams));
    }
  };


  const view = {
    init() {
      this.onlineStreams = $('.online-streams');
      this.offlineStreams = $('.offline-streams');
      this.allBtn = $('.all');
      this.onlineBtn = $('.online');
      this.offlineBtn = $('.offline');

      $('.form').submit((e) => {
        const name = $('.search').val().toLowerCase();
        view.warning('');
        e.preventDefault();

        // Check array to see if stream has already been added
        if (streams.indexOf(name) !== -1) {
          view.warning("Channel is already added");
          return;
        }
        app.findStream(name);
      });

      $('.load-samples').on('click', app.loadSamples);

      $('.all').on('click', () => {
        view.showAll();
      });

      $('.online').on('click', () => {
        view.showOnline();
      });

      $('.offline').on('click', () => {
        view.showOffline();
      });
    },

    addStream(response, streamName, url, streamType) {
      let $stream = $(`<div class="${streamType}-stream">`),
          $logo = $('<div class="stream-logo">'),
          $image = response.logo ? $(`<img src="${response.logo}">`) : $(`<img src="${response.stream.channel.logo}">`),
          $name = $(`<a href="${url}" class="stream-name">`),
          $status = $('<div class="stream-status">'),
          $deleteBtn = $(`<button class="delete" id=${streamName}>Delete</button>`);

      if (streamType === 'online') {
        $name.text(response.stream.channel.display_name);
        $status.text(response.stream.channel.status.substring(0, 50) + '...');
      } else if (streamType === 'offline') {
        $name.text(response.display_name);
        $status.text('Offline');
      }
      
      $logo.append($image);
      $stream.append($logo)
             .append($name)
             .append($status)
             .append($deleteBtn);

      $(`.${streamType}-streams`).append($stream);
      
      // Add event listener to delete button
      $(`#${streamName}`).click(() => {
        $stream.remove();
        app.deleteStream(streamName);
      });
    },

    warning(message) {
      $(".warning").text(message);
    },

    showAll() {
      this.onlineStreams.show();
      this.offlineStreams.show();
      this.allBtn.addClass('active');
      this.onlineBtn.removeClass('active');
      this.offlineBtn.removeClass('active');
    },

    showOnline() {
      this.offlineStreams.hide();
      this.onlineStreams.show();
      this.allBtn.removeClass('active');
      this.onlineBtn.addClass('active');
      this.offlineBtn.removeClass('active');
    },

    showOffline() {
      this.onlineStreams.hide();
      this.offlineStreams.show();
      this.allBtn.removeClass('active');
      this.onlineBtn.removeClass('active');
      this.offlineBtn.addClass('active');
    }
  };

  app.init();

})();
