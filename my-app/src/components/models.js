import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export const initializeModel = (modelContainer) => {
  if (!modelContainer) return null;

  // Инициализация Three.js сцены
  const scene = new THREE.Scene();
  // Делаем фон прозрачным вместо белого
  scene.background = null;

  // Настройка камеры
  const camera = new THREE.PerspectiveCamera(
    45, 
    modelContainer.clientWidth / modelContainer.clientHeight, 
    0.1, 
    1000
  );
  camera.position.z = 4;
  camera.position.y = 0;

  // Настройка рендерера - добавляем alpha: true для прозрачности
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true,
    preserveDrawingBuffer: false // Улучшает производительность
  });
  renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  // Явно устанавливаем прозрачность
  renderer.setClearColor(0x000000, 0);
  modelContainer.appendChild(renderer.domElement);

  // Улучшенное освещение
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  scene.add(directionalLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
  fillLight.position.set(-5, 0, -5);
  scene.add(fillLight);

  // Модель и контроллер
  let model = null;
  let controls = null;

  // Загрузка 3D модели
  const loader = new GLTFLoader();
  
  const loadModel = () => {
    return new Promise((resolve, reject) => {
      loader.load(
        '/models/medicine_chest.glb', 
        (gltf) => {
          model = gltf.scene;
          // Устанавливаем модель ниже - позиция по Y будет меняться с анимацией
          model.position.set(0, -0.8, 0); // Опускаем модель еще ниже
          model.scale.set(0.3, 0.3, 0.3);
          scene.add(model);

          // Автоматическое центрирование модели только по горизонтали
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          model.position.x -= center.x; // Центрируем только по X
          // Не меняем положение по Y, чтобы модель осталась внизу
          
          // Проверка видимости и теней
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.needsUpdate = true;
              }
            }
          });

          resolve(model);
        }, 
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        (error) => {
          console.error('An error occurred loading the model:', error);
          reject(error);
        }
      );
    });
  };

  // Сохраняем Controls только для автоматического вращения, но отключаем интерактивность
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  
  // Отключаем все взаимодействия пользователя с моделью
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableRotate = false;
  
  // Включаем автоматическое вращение
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.5;

  // Переменные для улучшенной "облачной" анимации
  const floatAmplitude = 0.15; // Амплитуда движения вверх-вниз
  const floatSpeed = 0.0005; // Скорость движения
  let baseY = -1.1; // Базовая позиция Y

  // Функция анимации - улучшаем "облачную" левитацию
  const animate = () => {
    const animationId = requestAnimationFrame(animate);
    
    if (controls) {
      controls.update();
    }
    
    if (model) {
      // Улучшенная анимация парения "как облако"
      const time = Date.now() * floatSpeed;
      // Синусоидальное движение для вертикального парения
      model.position.y = baseY + Math.sin(time) * floatAmplitude;
      
      // Добавляем небольшой наклон для естественности
      model.rotation.x = Math.sin(time * 0.5) * 0.02;
      model.rotation.z = Math.sin(time * 0.7) * 0.02;
      
      // Сохраняем плавное вращение для демонстрации полной модели
      model.rotation.y += 0.001;
    }
    
    renderer.render(scene, camera);
    return animationId;
  };
  
  // Делаем контейнер модели неинтерактивным с помощью CSS
  if (modelContainer) {
    modelContainer.style.pointerEvents = 'none';
  }
  
  // Функция обработки изменения размера
  const handleResize = () => {
    if (!modelContainer) return;
    
    camera.aspect = modelContainer.clientWidth / modelContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
  };

  window.addEventListener('resize', handleResize);
  
  // Запускаем анимацию
  const animationId = animate();
  
  // Загружаем модель
  loadModel().catch(error => console.error("Failed to load model:", error));
  
  // Возвращаем объект с ресурсами и методами для очистки
  return {
    scene,
    camera,
    renderer,
    controls,
    model,
    animationId,
    
    // Функция очистки ресурсов
    cleanup: () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      
      if (modelContainer && renderer) {
        modelContainer.removeChild(renderer.domElement);
      }
      
      if (scene && model) {
        scene.remove(model);
      }
      
      if (controls) {
        controls.dispose();
      }
      
      if (renderer) {
        renderer.dispose();
      }
    }
  };
};