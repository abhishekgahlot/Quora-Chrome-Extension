$(window).load(function () {

    //Speech recognition under development
    $('#start_mic_link').click(function () {
        $('#search').val('Under development');
    });

    //Internet connection check.
    window.addEventListener('online', function (e) {
        $('#loading-wrap,#loader-text').hide();
        $('#loader-text').text('');
        setTimeout(_run_api, 1500);
    }, false);

    window.addEventListener('offline', function (e) {
        $('#loading-wrap,#loader-text').show();
        $('#loader-text').text('Trying to connect to internet.');
        $('.notification').html('');
    }, false);

    //Global chrome tabs create function
    function _open_link(link) {
        chrome.tabs.create({
            url: link
        });
    }

    $('body').click(function () {
        $('#search_suggestions').hide();
    });

    $('#add-question').click(function () {
    	_open_link($(this).attr('href'));
    });

    //Global auth check
    $(document).ajaxError(function (event, xhr, settings, exception) {
        if (xhr.status == 401) {
            $('#login_modal').modal({
                show: true,
                keyboard: false,
                backdrop: 'static'
            });
            $('#login').click(function () {
                _open_link(this.href);
            });
        } else {
            $('#login_modal').modal('hide');
        }

		if(!navigator.onLine){
			$('#loading-wrap,#loader-text').show();
			$('#loader-text').text('Trying to connect to internet.');
		}

    });


    //Search ajax query
    $('#search').keyup(function () {

        if ($('#search').val() !== '') {
            _search = 'http://www.quora.com/ajax/query_suggestions?q=' + encodeURI($('#search').val()) +
                '&data=%7B%22query_hash%22%3A%221%22%7D&___W2_parentId=1&___W2_windowId=1';

            $.ajax({
                url: _search,
                success: function (data) {

                    $('#search_suggestions').show();

                    $('#search_suggestions').html(data['html']);

                    $('#search_suggestions li').click(function () {
                        search_query = $(this).children('.match_text').text();
                        search_type = $(this).children('.match_type').text();
                        search_value = $('#search').val();
                        if ($(this).text() == "Press Enter to Search") {
                            _open_link("http://www.quora.com/search?q=" + search_value.replace(/ /g, '+'));

                        } else {

                            if (search_type == 'Topic' || search_type == 'Profile') {
                                _open_link("http://www.quora.com/" + search_query.replace(/ /g, '-'));
                            } else {
                                _open_link("http://www.quora.com/search?q=" + search_query.replace(/ /g, '+'));
                            }
                        }
                    });
                }
            });

        } else {
            $('#search_suggestions').html('');
            $('#search_suggestions').hide();
        }
    });

    $(document).keypress(function (e) {
        if (e.which == 13) {
            _open_link("http://www.quora.com/search?q=" + $('#search').val().replace(/ /g, '+'));
        }
    });


    //Api-
	(_run_api=function (){
	    $.ajax({
	        url: 'http://www.quora.com/api/logged_in_user?fields=inbox,followers,following,notifs',
	        dataType: "text",
	        success: function (data) {
	            if (data == 'while(1);') {
	                $('#login_modal').modal({
	                    show: true,
	                    keyboard: false,
	                    backdrop: 'static'
	                });
	                $('#login').click(function () {
	                    _open_link(this.href);
	                });
	                $('#loading-wrap').hide();
	            } else {
	                data = JSON.parse(data.slice(9));
	                $('.name_notif_msg #name').text(data['name'].split(' ')[0]);
	                $('.name_notif_msg #msg_count').text(data['inbox']['unread_count']);
	                $('.name_notif_msg #notif_count').text(data['notifs']['unseen_count']);
	                $('.name_notif_msg #msg_count').text(data['inbox']['unread_count']);

	                var notifs = data['notifs']['unseen']

	                if (notifs.length !== 0) {

	                    $('.notif-well').show();

	                    $('.notification').html('');

	                    for (var i = 0; i < notifs.length; i++) {
	                        $('.notification').append('<p>' + (i + 1) + '. ' + notifs[i] + '</p>');
	                    }
	                } else {
	                    $('.notif-well').hide();
	                }

	                $('#loading-wrap').hide();
	            }

	            $('.notification a').click(function () {
	                if (typeof this.href !== undefined && this.href !== '') {
	                    _open_link(this.href);
	                }
	            });
	        }
	    });
	    return ;
	})();

    //Finds out hmac and formkey from source of html page.
    function get_hmac_fk() {

        //expire after 100 seconds
        time = Math.round(new Date().getTime() / 1000);

        if (jQuery.isEmptyObject(localStorage['time'])) {

            localStorage.setItem('time', time);

        }

        if (Math.round(new Date().getTime() / 1000) - localStorage['time'] >= 100 || jQuery.isEmptyObject(localStorage['hmac_fk'])) {

            return $.get('http://www.quora.com/about/resources', function (data) {
                regex = /"widgets_example_follow_button_code_wrapper",{"is_dark": false},"hmac:.*",{}\),/g;

                regex_fk = /formkey:.*",/g;

                match = data.match(new RegExp(regex));

                end = match[0].lastIndexOf('"');

                hmac = match[0].slice(70, end);

                match_fk = data.match(new RegExp(regex_fk));

                start_fk = match_fk[0].indexOf('"') + 1;

                end_fk = match_fk[0].lastIndexOf('"');

                form_key = match_fk[0].slice(start_fk, end_fk);

                dict = JSON.stringify({
                    'formkey': form_key,
                    'hmac': hmac
                });

                localStorage.setItem('hmac_fk', dict);
                localStorage.setItem('time', time);
            });

        } else {

            return 'None';
        }

    }


    //timer to avoid sending many requests to quora
    var timer;
    var interval = 3000;


    //Follow topics or people search
    $('#follow_search_input').keyup(function () {

        _topic_search_url = 'http://www.quora.com/ajax/topic_people_selector_results?q=' + encodeURI($('#follow_search_input').val()) +
            '&data=%7B%7D&___W2_parentId=1&___W2_windowId=1'


        timer = setTimeout(show_following_status, interval);

        $.ajax({
            url: _topic_search_url,
            success: function (data) {
                $('.follow_results').html(data['html']);
                $('.follow_results ul').addClass('list-group');
                $('.follow_results li').addClass('list-group-item');

                //Find ids of search and put them in li
                $('.follow_results li').each(function () {

                    x = $(this).attr('id');
                    x = x.slice(x.lastIndexOf('_') + 1);
                    re = new RegExp('"' + x + '\\":.{"type".*?}', 'g')
                    y = data['js'].match(new RegExp(re));
                    y = JSON.parse(y[0].slice(y[0].indexOf('{'), y[0].lastIndexOf('}') + 1));
                    $(this).attr('name', y['id']);
                    $(this).attr('data-type', y['type']);

                });

            }
        });



        //User stopped then send request only
        function show_following_status() {

            clearTimeout(timer);

            if (get_hmac_fk() == 'None') {

                form_key = JSON.parse(localStorage['hmac_fk'])['formkey']
                hmac = JSON.parse(localStorage['hmac_fk'])['hmac']
                $('.follow_results li').each(function () {
                    var name = $(this);
                    $.ajax({
                        url: 'http://www.quora.com/webnode2/server_call_POST?__instart__',
                        type: "POST",
                        data: {
                            json: '{"args":[],"kwargs":{"target_object_id":' + $(this).attr('name') + ',"target_is_user":false,"is_dark":false}}',
                            formkey: form_key,
                            postkey: 1,
                            window_id: 1,
                            referring_controller: "about",
                            referring_action: "resources",
                            __vcon_json: '["hmac","' + hmac + '"]',
                            __vcon_method: "get_widget_code",
                            __e2e_action_id: 1,
                            js_init: '{"is_dark":false}'
                        },
                        success: function (data) {
                            var re = /src=".*?"/;
                            data['value'] = data['value'].replace(new RegExp(re), 'src="../js/quora_widgets.js"');
                            name.append(data['value']);
                        }
                    });
                });


            } else {

                var promise_xhr = get_hmac_fk();

                promise_xhr.success(function (data) {

                    //Due to promise have to write this piece of code again to avoid sending request to fetch form key and hamc
                    $('.follow_results li').each(function () {
                        var name = $(this);
                        $.ajax({
                            url: 'http://www.quora.com/webnode2/server_call_POST?__instart__',
                            type: "POST",
                            data: {
                                json: '{"args":[],"kwargs":{"target_object_id":' + $(this).attr('name') + ',"target_is_user":false,"is_dark":false}}',
                                formkey: form_key,
                                postkey: 1,
                                window_id: 1,
                                referring_controller: "about",
                                referring_action: "resources",
                                __vcon_json: '["hmac","' + hmac + '"]',
                                __vcon_method: "get_widget_code",
                                __e2e_action_id: 1,
                                js_init: '{"is_dark":false}'
                            },
                            success: function (data) {
                                var re = /src=".*?"/;
                                data['value'] = data['value'].replace(new RegExp(re), 'src="../js/quora_widgets.js"');
                                name.append(data['value']);
                            }
                        });
                    });

                });

            }

        }

    });

});