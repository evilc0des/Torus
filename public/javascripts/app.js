var torus = angular.module('torusMain', []);

torus.controller('IndexController', function($scope, $http) {
	$scope.addTorrent = function() {

		var sendData = {
			url: $scope.torrentUrl
		}
		console.log('sentData ', sendData);
		$http.post("/addTorrent", sendData).then(function(response) {
			console.log(response);
			if(response.data.s == 'p')
			{
				console.log('Added Torrent id ', response.data.d);
				$scope.getTorrents();
			}
		});

	}

	$scope.removeTorrent = function(torrent) {

		var sendData = {
			torrent: torrent
		}
		console.log('sentData ', sendData);

		swal({
		  title: 'Are you sure?',
		  text: "You won't be able to revert this!",
		  type: 'warning',
		  showCancelButton: true,
		  confirmButtonColor: '#3085d6',
		  cancelButtonColor: '#d33',
		  confirmButtonText: 'Yes, delete it!'
		}).then(function () {
			$http.post("/removeTorrent", sendData).then(function(response) {
				console.log(response);
				if(response.data.s == 'p')
				{
					console.log('Removed Torrent id ', torrent.id);
					swal(
					    'Deleted!',
					    'Your torrent has been deleted.',
					    'success'
					);
					$scope.getTorrents();
				}
			});
		});
	}

	$scope.getTorrents = function() {

		$http.get('/getTorrents').then(function(response){
			if(response.data.s == 'p')
			{
				console.log(response.data.d);
				$scope.torrents = response.data.d.torrents;
			}

			for (var i = 0; i < $scope.torrents.length; i+=1) {
			  	if($scope.torrents[i].percentDone*100 < 100)
				{
					setTimeout(function(){$scope.getTorrents();}, 2000);
					break;
				}
			}
			
		});
	}

	$scope.playFile = function(torrent, file) {

		var sendData = {
			torrent: torrent,
			filename: file.name
		}
		console.log('sentData ', sendData);
		$http.post("/addStream", sendData).then(function(response) {
			console.log(response);
			if(response.data.s == 'p')
			{
				$scope.openedTorrent.files.map(function(f) {
					if(f.name == file.name)
					{
						f.streamUrl = location.hostname + '/stream/' + response.data.d;
					}
				})
				//$scope.streamUrl = conf.host + '/stream/' + response.data.d;
			}
		});

	}


	$scope.openTorrent = function(torrent) {
		if($scope.openedTorrent)
			$scope.openedTorrent = undefined;
		else
			$scope.openedTorrent = torrent;
	}
});