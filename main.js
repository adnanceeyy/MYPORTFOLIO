// --- INITIALIZATION ---
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis();
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// --- LOADER REVEAL ---
window.onload = () => {
  const tl = gsap.timeline();
  tl.to('.loader-bar span', { width: '100%', duration: 1, ease: 'power2.inOut' })
    .to('.loader', { yPercent: -100, duration: 1, ease: 'expo.inOut' })
    .from('.hero-title, .hero-tag, .hero-sub', { 
        y: 100, opacity: 0, stagger: 0.1, duration: 1.2, ease: 'power4.out' 
    }, '-=0.5');
};

// --- CURSOR ---
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
window.addEventListener('mousemove', (e) => {
  gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
  gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.25 });
});

// --- THREE.JS BACKGROUND: THE VOLUMETRIC STORM ---
const canvas = document.querySelector('#canvas-webgl');
if (canvas) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Cloud
    const particleCount = 2000;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 15;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.015,
        color: 0x00ffcc,
        transparent: true,
        opacity: 0.4
    });
    
    const particlesMesh = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particlesMesh);

    // Central Morph Orb
    const orbGeo = new THREE.IcosahedronGeometry(1.5, 4);
    const orbMat = new THREE.MeshPhongMaterial({
        color: 0x00ffcc,
        wireframe: true,
        transparent: true,
        opacity: 0.08,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    scene.add(orb);

    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(2, 5, 5);
    scene.add(light);
    camera.position.z = 6;

    const clock = new THREE.Clock();
    function animate() {
        const elapsedTime = clock.getElapsedTime();
        particlesMesh.rotation.y = elapsedTime * 0.1;
        orb.rotation.y = elapsedTime * 0.3;
        orb.rotation.z = elapsedTime * 0.2;
        
        // Orb Breathing Effect
        const s = 1 + Math.sin(elapsedTime) * 0.1;
        orb.scale.set(s,s,s);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// --- HORIZONTAL ENGINE ---
const container = document.querySelector('.horizontal-container');
const panels = gsap.utils.toArray('.panel');

if (window.innerWidth > 900) {
    const horizontalTl = gsap.to(container, {
        x: () => -(container.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
            trigger: ".page-wrapper",
            pin: true,
            scrub: 1,
            end: () => "+=" + container.scrollWidth,
            onUpdate: (self) => {
                gsap.to('.progress-bar', { width: self.progress * 100 + '%' });
            }
        }
    });

    // Panel Entrances
    panels.forEach((panel, i) => {
        const title = panel.querySelector('h1, h2');
        if (title) {
            gsap.from(title, {
                opacity: 0,
                x: 100,
                duration: 1.5,
                ease: "power4.out",
                scrollTrigger: {
                    trigger: title,
                    containerAnimation: horizontalTl,
                    start: "left 80%",
                }
            });
        }
    });

    // Project Card Stagger
    gsap.from('.p-card', {
        opacity: 0,
        y: 100,
        stagger: 0.1,
        duration: 1,
        scrollTrigger: {
            trigger: '.works',
            containerAnimation: horizontalTl,
            start: "left 70%",
        }
    });

} else {
    // Vertical Fallback (Mobile)
    panels.forEach(panel => {
        gsap.from(panel, {
            opacity: 0,
            y: 50,
            scrollTrigger: {
                trigger: panel,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        });
    });
}

// Nav Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('href');
        lenis.scrollTo(target);
    });
});
