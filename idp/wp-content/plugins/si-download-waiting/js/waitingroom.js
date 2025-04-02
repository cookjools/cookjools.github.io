(function($){

	function getDownloadStatus(manifest,canvas_index,handler) {

		$.post('/wp-admin/admin-ajax.php', {
			action: 'iiif_download_images',
			manifest: manifest,
			canvas_index: canvas_index
			}, handler
		)

	}

	function addPendingDownload(manifest) {
		var pending = window.localStorage.getItem('waiting-room-pending');
		if (!pending) {
			pending = [];
		} else {
			pending = JSON.parse(pending);
		}
		// only include anything in the last x days
		pending = pending.filter((i) => i.timestamp > Date.now() - (1000 *60 * 60 * 24 * 7) );
		// only add if it isn't already in the list
		if (0 == pending.filter((i)=>i.manifest == manifest.manifest && i.canvas_index == manifest.canvas_index ).length ) {
			pending.push(manifest);
		}
		// maximum 20 downloads allowed, so only store the latest 20
		if (pending.length>20) {
			pending = pending.slice(-20);
		}
		window.localStorage.setItem('waiting-room-pending',JSON.stringify(pending));
	}
	function getPendingDownloads() {
		var pending = window.localStorage.getItem('waiting-room-pending');
		if (!pending) {
			pending = [];
		} else {
			pending = JSON.parse(pending);
		}
		return pending;
	}
	function clearPendingDownloads() {
		var pending=[];
		window.localStorage.setItem('waiting-room-pending',JSON.stringify(pending));
	}

	$(function() {

	/*	// initial timeout to override the button.download-all click behaviour

		setTimeout(function() {

			// override the default "download all images" click handler

			$('button.download-all').on('click',function(e) {
				// if we are lucky will prevent other handlers from working
				e.stopPropagation();
				e.preventDefault();

				var m =  $(this).attr('data-manifest'); // 'https://data.idp.bl.uk/iiif/3/manifest/EB03509F8A3742288CF3835FBDBA4441';
				var p = $(this).attr('data-pressmark');

				getDownloadStatus(m,-1,function(data) {

					// console.log(data);
					if (confirm('Any images downloaded from this website are intended for non commercial use only.')) {
						if ( Number.isInteger(data) ) {
							addPendingDownload({manifest:m,pressmark:p,canvas_index: -1,timestamp:Date.now()})
							// go to waiting room
							window.open('/downloads/','_blank');
						} else {
							window.open(data,'_blank');
						}
					}

				})
				
			})

			$('button.download-single').on('click',function(e) {
				// if we are lucky will prevent other handlers from working
				e.stopPropagation();
				e.preventDefault();

				var m =  $(this).attr('data-manifest'); // 'https://data.idp.bl.uk/iiif/3/manifest/EB03509F8A3742288CF3835FBDBA4441';
				var p = $(this).attr('data-pressmark');
				var i = $(this).attr('data-canvas-index');

				getDownloadStatus(m,i,function(data) {

					// console.log(data);
					if (confirm('Any images downloaded from this website are intended for non commercial use only.')) {
						if (false == data) {
							addPendingDownload({manifest:m,pressmark:p,canvas_index:i})
							// go to waiting room
							window.open('/downloads/','_blank');
						} else {
							window.open(data,'_blank');
						}
					}

				})
				
			})


		},500);
*/

		// show the pending downloads

		var waitingRoom = $('#waiting-room')

		function clearDownloads() {
			clearPendingDownloads();
			waitingRoom.empty();
		}
		
		if (1 == waitingRoom.length) {
			var pending = getPendingDownloads();
			pending.forEach(function(item) {
				// console.log(item);
				var secondsWait = 9; // how long between checks (but doubled subsequently)
				var manifest = item.manifest;
				var pressmark = item.pressmark;
				var canvas_index = item.canvas_index;
				var display = pressmark + (-1 != canvas_index ? ' ['+(parseInt(canvas_index)+1)+'] ': '' );
				var statusEntry = $('<div class="download"></div>')
				statusEntry.text(display+' checking...');
				waitingRoom.append(statusEntry);

				var statusUpdate =function(data) {

					if (Number.isInteger(data) ) {
						var pos = data + 1;
						statusEntry.text(display+' is position '+pos+' in the queue');
						setTimeout(function() {
							statusEntry.text(display+' checking...');
							secondsWait = secondsWait * 2; // place nicely
							getDownloadStatus(manifest,canvas_index,statusUpdate);
						},secondsWait*1000+Math.floor(Math.random() * 1000)) // random for some variation so requests not simultaneous
					} else {
						statusEntry.empty();
						statusEntry.append($('<a target="_blank"></a>').attr('href',data).text(display+' ready to download'));
					}
				}
				getDownloadStatus(manifest,canvas_index,statusUpdate)
			})
			if (0 != pending.length) {
				waitingRoom.append($('<button>Clear download list</button>').click(clearDownloads))
			}
		}


	})

})(jQuery)