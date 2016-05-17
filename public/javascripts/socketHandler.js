var audioObject = null;

var init = function(){
    var submit = document.getElementById('send');
    var firstArtist = document.getElementById('firstName').innerHTML;
    var secondArtist = document.getElementById('secondName').innerHTML;


    socket = io.connect();

    $('.cover').on('click', getTrack);

    socket.on('similarArtist', function(data){
        document.getElementById('similarName').innerHTML = data.name;

        $('.cover').css('height', '250');
        $('.cover').css('width', '250');
        $('#album1').css('background-image', 'url(' + data.albums[0].images[1].url + ')');
        $('#album2').css('background-image', 'url(' + data.albums[1].images[1].url + ')');
        $('#album3').css('background-image', 'url(' + data.albums[2].images[1].url + ')');

        $('#album1').attr('album-id', data.albums[0].id);
        $('#album2').attr('album-id', data.albums[1].id);
        $('#album3').attr('album-id', data.albums[2].id);

    });

    socket.on('pictures', function(data){
        var image1 = document.getElementById('image1');
        var image2 = document.getElementById('image2');

        image1.src = data.first;
        image2.src = data.second;
    })
    
    var submitArtist = function(){
        socket.emit('similarArtist', {first: firstArtist, second: secondArtist});
    }

    submit.addEventListener("click", submitArtist);

    socket.emit('pictures', {first: firstArtist, second: secondArtist});
}

var getTrack = function(e){
    var target= e.target;

    if(target !== null && target.classList.contains('cover')){
        if (target.classList.contains('playing')){
            audioObject.pause();
        }
        else{
            if(audioObject){
                audioObject.pause();
            }
            socket.emit('tracks', {id: target.getAttribute('album-id')});
        }
    }

    socket.on('track', function(data){
        audioObject = new Audio(data);
        audioObject.play();
        target.classList.add('playing');
        audioObject.addEventListener('ended', function () {
            target.classList.remove('playing');
            audioObject = null;
            socket.removeAllListeners('track');
        });
        audioObject.addEventListener('pause', function () {
            target.classList.remove('playing');
            audioObject = null
            socket.removeAllListeners('track');
        });
    })
}
window.onload = init;