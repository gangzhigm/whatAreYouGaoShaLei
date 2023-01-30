/* -----------------------------------------------
/* How to use? : Check the GitHub README
/* ----------------------------------------------- */

/* To load a config file (particles.json) you need to host this demo (MAMP/WAMP/local)... */
/*
particlesJS.load('particles-js', 'particles.json', function() {
  console.log('particles.js loaded - callback');
});
*/

/* Otherwise just put the config content (json): */
import norcss from 'normalize.css';
import particles from 'particles.js';
import imageURLo from '../O.png';
import imageURLx from '../X.png';
import imageURLs from '../^.png';
import imageURLf from '../#.png';
particlesJS('particles-jsX', {
  //原子
  "particles": {
    "number": {
      "value": 10,
      "density": {
        "enable": true,
        "value_area": 800
      }
    },
    "color": {
      "value": "#ff5252"
    },
    "shape": {
      "type":["image","image"],
      "stroke": {
        "width": 1000,
        "color": "#ff5252"
      },
      "polygon": {
        "nb_sides": 0
      },
      "image": {
        "src": imageURLx,
        "width": 10,
        "height": 10
      },
    },
    "opacity": {
      "value": 0.5,
      "random": true,
      "anim": {
        "enable": false,
        "speed": 3,
        "opacity_min": 0.1,
        "sync": false
      }
    },
    "size": {
      "value": 10,
      "random": false,
      "anim": {
        "enable": false,
        "speed": 40,
        "size_min": 0.1,
        "sync": false
      }
    },
    "line_linked": {
      "enable": false,
      "distance": 150,
      "color": "#ffffff",
      "opacity": 0.4,
      "width": 1
    },
    "move": {
      "enable": true,
      "speed": 4,
      "direction": "none",
      "random": true,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": false,
        "rotateX": 100,
        "rotateY": 1200
      }
    }
  },
 //互动
 "interactivity": {
  "detect_on": "Window",
  "events": {
    "onhover": {
      "enable": true,
      "mode": "grab"
    },
    "onclick": {
      "enable": false,
      "mode": "repulse"
    },
    "resize": false
  },
  "modes": {
    "grab": {
      "distance": 50,
      "line_linked": {
        "opacity": 0
      }
    },
    "bubble": {
      "distance": 400,
      "size": 40,
      "duration": 2,
      "opacity": 8,
      "speed": 3
    },
    "repulse": {
      "distance": 200,
      "duration": 0.4
    },
    "push": {
      "particles_nb": 4
    },
    "remove": {
      "particles_nb": 2
    }
  }
},
"retina_detect": true
});
particlesJS('particles-jsO', {
  //原子
  "particles": {
    "number": {
      "value": 10,
      "density": {
        "enable": true,
        "value_area": 800
      }
    },
    "color": {
      "value": "#ff5252"
    },
    "shape": {
      "type":["image"],
      "stroke": {
        "width": 1000,
        "color": "#ff5252"
      },
      "polygon": {
        "nb_sides": 0
      },
      "image": {
        "src": imageURLo,
        "width": 10,
        "height": 10
      },
    },
    "opacity": {
      "value": 0.5,
      "random": true,
      "anim": {
        "enable": false,
        "speed": 3,
        "opacity_min": 0.1,
        "sync": false
      }
    },
    "size": {
      "value": 10,
      "random": false,
      "anim": {
        "enable": false,
        "speed": 40,
        "size_min": 0.1,
        "sync": false
      }
    },
    "line_linked": {
      "enable": false,
      "distance": 150,
      "color": "#ffffff",
      "opacity": 0.4,
      "width": 1
    },
    "move": {
      "enable": true,
      "speed": 4,
      "direction": "none",
      "random": true,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": false,
        "rotateX": 100,
        "rotateY": 1200
      }
    }
  },
 //互动
 "interactivity": {
  "detect_on": "Window",
  "events": {
    "onhover": {
      "enable": true,
      "mode": "grab"
    },
    "onclick": {
      "enable": false,
      "mode": "repulse"
    },
    "resize": false
  },
  "modes": {
    "grab": {
      "distance": 50,
      "line_linked": {
        "opacity": 0
      }
    },
    "bubble": {
      "distance": 400,
      "size": 40,
      "duration": 2,
      "opacity": 8,
      "speed": 3
    },
    "repulse": {
      "distance": 200,
      "duration": 0.4
    },
    "push": {
      "particles_nb": 4
    },
    "remove": {
      "particles_nb": 2
    }
  }
},
"retina_detect": true
});
particlesJS('particles-jsS', {
  //原子
  "particles": {
    "number": {
      "value": 10,
      "density": {
        "enable": true,
        "value_area": 800
      }
    },
    "color": {
      "value": "#ff5252"
    },
    "shape": {
      "type":["image"],
      "stroke": {
        "width": 1000,
        "color": "#ff5252"
      },
      "polygon": {
        "nb_sides": 0
      },
      "image": {
        "src": imageURLs,
        "width": 10,
        "height": 10
      },
    },
    "opacity": {
      "value": 0.5,
      "random": true,
      "anim": {
        "enable": false,
        "speed": 3,
        "opacity_min": 0.1,
        "sync": false
      }
    },
    "size": {
      "value": 10,
      "random": false,
      "anim": {
        "enable": false,
        "speed": 40,
        "size_min": 0.1,
        "sync": false
      }
    },
    "line_linked": {
      "enable": false,
      "distance": 150,
      "color": "#ffffff",
      "opacity": 0.4,
      "width": 1
    },
    "move": {
      "enable": true,
      "speed": 4,
      "direction": "none",
      "random": true,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": false,
        "rotateX": 100,
        "rotateY": 1200
      }
    }
  },
 //互动
 "interactivity": {
  "detect_on": "Window",
  "events": {
    "onhover": {
      "enable": true,
      "mode": "grab"
    },
    "onclick": {
      "enable": false,
      "mode": "repulse"
    },
    "resize": false
  },
  "modes": {
    "grab": {
      "distance": 50,
      "line_linked": {
        "opacity": 0
      }
    },
    "bubble": {
      "distance": 400,
      "size": 40,
      "duration": 2,
      "opacity": 8,
      "speed": 3
    },
    "repulse": {
      "distance": 200,
      "duration": 0.4
    },
    "push": {
      "particles_nb": 4
    },
    "remove": {
      "particles_nb": 2
    }
  }
},
"retina_detect": true
});
particlesJS('particles-jsF', {
  //原子
  "particles": {
    "number": {
      "value": 10,
      "density": {
        "enable": true,
        "value_area": 1000
      }
    },
    "color": {
      "value": "#ff5252"
    },
    "shape": {
      "type":["image"],
      "stroke": {
        "width": 10,
        "color": "#ff5252"
      },
      "polygon": {
        "nb_sides": 0
      },
      "image": {
        "src": imageURLf,
        "width": 10,
        "height": 10
      },
    },
    "opacity": {
      "value": 0.5,
      "random": true,
      "anim": {
        "enable": false,
        "speed": 3,
        "opacity_min": 0.1,
        "sync": false
      }
    },
    "size": {
      "value": 10,
      "random": false,
      "anim": {
        "enable": false,
        "speed": 40,
        "size_min": 0.1,
        "sync": false
      }
    },
    "line_linked": {
      "enable": false,
      "distance": 150,
      "color": "#ffffff",
      "opacity": 0.4,
      "width": 1
    },
    "move": {
      "enable": true,
      "speed": 4,
      "direction": "none",
      "random": true,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": false,
        "rotateX": 100,
        "rotateY": 1200
      }
    }
  },
  //互动
  "interactivity": {
    "detect_on": "Window",
    "events": {
      "onhover": {
        "enable": true,
        "mode": "grab"
      },
      "onclick": {
        "enable": false,
        "mode": "repulse"
      },
      "resize": false
    },
    "modes": {
      "grab": {
        "distance": 50,
        "line_linked": {
          "opacity": 0
        }
      },
      "bubble": {
        "distance": 400,
        "size": 40,
        "duration": 2,
        "opacity": 8,
        "speed": 3
      },
      "repulse": {
        "distance": 200,
        "duration": 0.4
      },
      "push": {
        "particles_nb": 4
      },
      "remove": {
        "particles_nb": 2
      }
    }
  },
  "retina_detect": true
});