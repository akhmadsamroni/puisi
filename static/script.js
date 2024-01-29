//animasi puisi------------------------------------------------------------

//end of animasi puisi------------------------------------------------------------

// ANIMATED WORDS ---------------------------------------------------------
window.onload = function() {
  var lyric = "Aku  ingin  mencintaimu  dengan sederhana dengan kata yang tak sempat diucapkan kayu kepada api yang menjadikannya abu Aku ingin mencintaimu dengan sederhana dengan isyarat yang tak sempat disampaikan awan kepada hujan yang menjadikannya tiada, Aku ingin mencintaimu dengan sederhana dengan kata yang tak sempat diucapkan kayu kepada api yang menjadikannya abu Aku ingin mencintaimu dengan sederhana dengan isyarat yang tak sempat disampaikan awan kepada hujan yang menjadikannya tiada ";
  var words = {};
  var words_attr = [];
  string_handle(lyric);

  var canvas = document.getElementById('c');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  if (canvas.getContext) {
    var c = canvas.getContext('2d'),
      w = canvas.width,
      h = canvas.height;

    c.strokeStyle = 'red';
    c.fillStyle = 'white';
    c.lineWidth = 5;

    function Word(key) {
      this.text = key;
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.font = words[key] * 10 + 'px arial';
      this.speed = words[key];
      this.width = c.measureText(this.text).width;
      this.color = getRandomColor();
    }
    function getRandomColor() {
      var letters = '0123456789ABCDEF';
      var color = '#';
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

    for (var key in words) {
      words_attr.push(new Word(key));
    }

    function animation() {
      for (var i = 0; i < words_attr.length; i++) {
        c.font = words_attr[i].font;
        c.fillStyle = words_attr[i].color; // use the word's color property
        c.fillText(words_attr[i].text, words_attr[i].x, words_attr[i].y);
        words_attr[i].width = c.measureText(words_attr[i].text).width;
      }
      c.stroke();
      move();
    }


    function move() {
      for (var i = 0; i < words_attr.length; i++) {
        if (words_attr[i].x > w) {
          words_attr[i].x = -words_attr[i].width;
          words_attr[i].y = Math.random() * h;
        } else {
          words_attr[i].x += words_attr[i].speed;
        }
      }
    }

    setInterval(function() {
      c.clearRect(0, 0, w, h);
      animation();
    }, 24);
  }

  function string_handle(str) {
    var split_str = str.split(" ");
    var word_array = [];
    var word_count = [];
    for (var i = 0; i < split_str.length; i++) {
      var check = true;
      for (var j = 0; j <= word_array.length; j++) {
        if (split_str[i] == word_array[j]) {
          word_count[j]++;
          check = false;
          break;
        }
      }
      if (check) {
        word_array.push(split_str[i]);
        word_count.push(1);
      }
    }
    for (var i = 0; i < word_array.length; i++) {
      words[word_array[i]] = word_count[i];
    }
    return words;
  }
}

// END ANIMATE WORDS ---------------------------------------------------------

// NAVBAR ACTIV
document.addEventListener('DOMContentLoaded', function() {
  // Mendapatkan URL halaman saat ini
  var currentURL = window.location.href;

  // Mendapatkan elemen menu navigasi
  var menuItems = document.querySelectorAll('.nav-link');

  // Memeriksa setiap elemen menu
  for (var i = 0; i < menuItems.length; i++) {
    var menuItem = menuItems[i];

    // Memeriksa apakah URL menu sama dengan URL halaman saat ini
    if (menuItem.href === currentURL) {
      // Menambahkan kelas 'active' pada menu yang sesuai
      menuItem.classList.add('active');
    }
  }
});
// END NAVBAR ACTIV

// EXAMPLE TEXT ---------------------------------------------------------
window.addEventListener('DOMContentLoaded', (event) => {
  var inputText = document.getElementById("inputPuisi");
  var example1 = document.getElementById("example1");
  var example2 = document.getElementById("example2");

  example1.addEventListener("click", function() {
    inputText.value = example1.textContent.replace(/^.(.*).$/, "$1");
  });

  example2.addEventListener("click", function() {
    inputText.value = example2.textContent.replace(/^.(.*).$/, "$1");
  });
});
// END EXAMPLE TEXT ---------------------------------------------------------
// SPINER BORDER LOADING
document.addEventListener('DOMContentLoaded', function() {
    var button = document.querySelector('.browse');
    var icon = document.getElementById('icon');

    button.addEventListener('click', function() {
      icon.classList.remove('bi-send');
      icon.classList.add('spinner-border', 'spinner-border-sm');
      icon.setAttribute('role', 'status');
      icon.innerHTML = '<span class="visually-hidden">Loading...</span>';

      // Simulate a delay to demonstrate the spinner
      setTimeout(function() {
        // Restore the original icon
        icon.classList.remove('spinner-border', 'spinner-border-sm');
        icon.classList.add('bi-send');
        icon.removeAttribute('role');
        icon.innerHTML = '';
      }, 10000);
    });
  });
// END SPINER BORDER LOADING
// PREVIEW PUISI
window.addEventListener('DOMContentLoaded', (event) => {
  // Mendapatkan nilai teks dari input dan textarea
  const judulInput = document.getElementById("id_judul");
  const puisiTextarea = document.getElementById("id_puisi");
  const preJudul = document.getElementById("pre_judul");
  const prePuisi = document.getElementById("pre_puisi");

  // Menampilkan teks dari input pada elemen h3
  preJudul.textContent = judulInput.value;

  // Menampilkan teks dari textarea pada elemen pre
  prePuisi.textContent = puisiTextarea.value;

  // Event listener saat input atau textarea berubah
  judulInput.addEventListener("input", function () {
    preJudul.textContent = judulInput.value;
  });

  puisiTextarea.addEventListener("input", function () {
    prePuisi.textContent = puisiTextarea.value;
  });
});
// END PREVIEW PUISI
// PREVIEW IMAGE UPLOAD
document.addEventListener('DOMContentLoaded', function() {
  var profilePictureInput = document.getElementById('profilePicture');
  
  profilePictureInput.addEventListener('change', function(event) {
    var previewImage = document.getElementById('previewImage');
    previewImage.src = URL.createObjectURL(event.target.files[0]);
    previewImage.classList.remove('d-none');
  });
});
// END PREVIEW IMAGE UPLOAD
// RESPONSIVE TEXT PREVIEW
function makeParagraphResponsive() {
    var paragraphElement = document.getElementById('textResponsif');
    var windowWidth = window.innerWidth;

    if (windowWidth <= 576) {
      paragraphElement.style.fontSize = '14px';
    } else {
      paragraphElement.style.fontSize = ''; // Kembalikan ke ukuran font default jika tidak pada tampilan mobile
    }
  }

  // Panggil fungsi makeParagraphResponsive saat halaman dimuat dan saat jendela diubah ukurannya
  window.addEventListener('load', makeParagraphResponsive);
  window.addEventListener('resize', makeParagraphResponsive);
// END RESPONSIVE TEXT PREVIEW
//ALERT DISMISS
document.addEventListener('DOMContentLoaded', function() {
  var autoDismissElements = document.getElementsByClassName("alert");

  // Fungsi untuk menghilangkan elemen alert setelah 5 detik
  function dismissAlert(element) {
    setTimeout(function() {
      element.remove();
    }, 4000);
  }

  // Tambahkan kelas "fade" dan "show" pada elemen alert
  for (var i = 0; i < autoDismissElements.length; i++) {
    autoDismissElements[i].classList.add("fade", "show");
    // Panggil fungsi untuk menghilangkan elemen alert
    dismissAlert(autoDismissElements[i]);
  }
});
//END ALERT DISMISS 

// SOSMED SHARE & COPY BUTTON ------------------------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', (event) => {
  const content = `${window.location.href} \n\n ${document.body.innerText}`;
  const link = window.location.href;
  const contentBlockquote = document.querySelector("pre").innerText;

  // Function to copy content
  function copyContent(content) {
    // Create a temporary input element
    let tempInput = document.createElement("input");
    // Set its value to the content
    tempInput.value = content;
    // Append it to the body
    document.body.appendChild(tempInput);
    // Select its content
    tempInput.select();
    // Copy the content to the clipboard
    document.execCommand("copy");
    // Remove the input element
    document.body.removeChild(tempInput);
    // Show a success message
    var iconElement = document.getElementById("copy-icon");
    iconElement.classList.remove("bi-clipboard");
    iconElement.innerHTML = '<i class="bi bi-check-lg"></i> Tersalin';
    
    // icon back after 2 sec
    setTimeout(function() {
      iconElement.innerHTML = '<i class="bi bi-clipboard"></i>';
    }, 2000);
  }
  // Function to share on Facebook
  function shareFacebook(content) {
    // Open a new window to share the content on Facebook
    window.open(`https://www.facebook.com/sharer.php?u=${encodeURIComponent(content)}&url=${encodeURIComponent(link)}`);
  }

  // Function to share on Twitter
  function shareTwitter(content) {
    // Open a new window to share the content on Twitter
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}&url=${encodeURIComponent(link)}`);
  }

  // Function to share on WhatsApp
  function shareWhatsApp(content) {
    // Open a new window to share the content on WhatsApp
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(content)}&url=${encodeURIComponent(link)}`);
  }

  // Function to share on Instagram
  function shareInstagram(content) {
    // Open a new window to share the content on Instagram
    window.open(`https://www.instagram.com/share?url=${encodeURIComponent(content)}&url=${encodeURIComponent(link)}`);
  }

  // Tombol Share ke Facebook
  document.getElementById("share-facebook").addEventListener("click", function() {
    shareFacebook(contentBlockquote);
  });

  // Tombol Share ke Twitter
  document.getElementById("share-twitter").addEventListener("click", function() {
    shareTwitter(contentBlockquote);
  });

  // Tombol Share ke WhatsApp
  document.getElementById("share-whatsapp").addEventListener("click", function() {
    shareWhatsApp(contentBlockquote);
  });

  // Tombol Share ke Instagram
  document.getElementById("share-instagram").addEventListener("click", function() {
    shareInstagram(contentBlockquote);
  });

  // Tombol Copy Link
  document.getElementById("copy-link").addEventListener("click", function() {
    copyContent(contentBlockquote);
  });

  // Tombol Kembali
  document.getElementById("go-back").addEventListener("click", function() {
    history.back();
  });
  // Tombol Kembali
  document.getElementById("go-home").addEventListener("click", function() {
    var url = this.getAttribute("data-url");
    window.location.href = url;
  });
});

  // END OF SOSMED SHARE & COPY BUTTON ----------------------------------------------------------------------------