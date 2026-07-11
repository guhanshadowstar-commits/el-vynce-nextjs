"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/* Subtle, slow 3D rotating garment-silhouette accent — ported from the old
   site's js/pdp-three.js (which loaded three.js r125 as a global <script>,
   a different/older version than the hero's ES-module three@0.160). Here it
   just uses the same npm `three` package as the hero scene — the API this
   file touches (BoxGeometry, CylinderGeometry, MeshBasicMaterial,
   PerspectiveCamera, WebGLRenderer) hasn't changed across those versions. */
export default function PdpViewer() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    container.appendChild(renderer.domElement);

    const bodyGeometry = new THREE.BoxGeometry(1, 1.4, 0.4);
    const sleeveLGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.8);
    const sleeveRGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.8);

    const material = new THREE.MeshBasicMaterial({
      color: 0x111111,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });

    const body = new THREE.Mesh(bodyGeometry, material);
    const sleeveL = new THREE.Mesh(sleeveLGeometry, material);
    const sleeveR = new THREE.Mesh(sleeveRGeometry, material);

    sleeveL.position.set(-0.6, 0.3, 0);
    sleeveL.rotation.z = Math.PI / 4;
    sleeveR.position.set(0.6, 0.3, 0);
    sleeveR.rotation.z = -Math.PI / 4;

    const garment = new THREE.Group();
    garment.add(body, sleeveL, sleeveR);
    scene.add(garment);

    camera.position.z = 3;

    let rafId = null;
    function animate() {
      rafId = requestAnimationFrame(animate);
      garment.rotation.y += 0.0025;
      garment.position.y = Math.sin(Date.now() * 0.0004) * 0.04;
      renderer.render(scene, camera);
    }
    animate();

    const onResize = () => {
      const w = container.clientWidth || width;
      const h = container.clientHeight || height;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      bodyGeometry.dispose();
      sleeveLGeometry.dispose();
      sleeveRGeometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full" />;
}
