import './style.css';
import {
  ACESFilmicToneMapping,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  InstancedMesh,
  Matrix4,
  MOUSE,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  SRGBColorSpace,
  Scene,
  Vector2,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { buildObjMeshWithVertexColors } from './core/exportUtils';
import { MaterialController } from './core/materialController';
import { SwarmTrailsEngine, type SwarmSnapshot } from './core/swarmTrailsEngine';
import { buildTrailMeshGeometry } from './core/trailMeshBuilder';
import type {
  AppState,
  EmitterSettings,
  GradientType,
  GrowthSettings,
  MaterialSettings,
  ParticleSettings,
  SimulationSettings,
} from './types';

type UiRefs = {
  panel: HTMLDivElement;
  handleTop: HTMLDivElement;
  handleBottom: HTMLDivElement;
  collapseToggle: HTMLButtonElement;
  start: HTMLButtonElement;
  reset: HTMLButtonElement;
  growthSpeed: HTMLInputElement;
  growthSpeedValue: HTMLSpanElement;
  timeline: HTMLInputElement;
  timelineValue: HTMLSpanElement;
  emitterCountX: HTMLInputElement;
  emitterCountXValue: HTMLSpanElement;
  emitterCountY: HTMLInputElement;
  emitterCountYValue: HTMLSpanElement;
  emitterCountZ: HTMLInputElement;
  emitterCountZValue: HTMLSpanElement;
  emitterSpacingX: HTMLInputElement;
  emitterSpacingXValue: HTMLSpanElement;
  emitterSpacingY: HTMLInputElement;
  emitterSpacingYValue: HTMLSpanElement;
  emitterSpacingZ: HTMLInputElement;
  emitterSpacingZValue: HTMLSpanElement;
  trailLength: HTMLInputElement;
  trailLengthValue: HTMLSpanElement;
  generationDistance: HTMLInputElement;
  generationDistanceValue: HTMLSpanElement;
  trailThickness: HTMLInputElement;
  trailThicknessValue: HTMLSpanElement;
  noiseScale: HTMLInputElement;
  noiseScaleValue: HTMLSpanElement;
  noiseSpeed: HTMLInputElement;
  noiseSpeedValue: HTMLSpanElement;
  noiseStrength: HTMLInputElement;
  noiseStrengthValue: HTMLSpanElement;
  vorticity: HTMLInputElement;
  vorticityValue: HTMLSpanElement;
  attraction: HTMLInputElement;
  attractionValue: HTMLSpanElement;
  damping: HTMLInputElement;
  dampingValue: HTMLSpanElement;
  gradientType: HTMLSelectElement;
  gradientStart: HTMLInputElement;
  gradientEnd: HTMLInputElement;
  curvatureContrast: HTMLInputElement;
  curvatureContrastValue: HTMLSpanElement;
  curvatureBias: HTMLInputElement;
  curvatureBiasValue: HTMLSpanElement;
  gradientBlur: HTMLInputElement;
  gradientBlurValue: HTMLSpanElement;
  fresnel: HTMLInputElement;
  fresnelValue: HTMLSpanElement;
  specular: HTMLInputElement;
  specularValue: HTMLSpanElement;
  bloom: HTMLInputElement;
  bloomValue: HTMLSpanElement;
  exportObj: HTMLButtonElement;
  exportGlb: HTMLButtonElement;
  exportScreenshot: HTMLButtonElement;
};

type TimelineEntry = { step: number; snapshot: SwarmSnapshot };

const MAX_TIMELINE_SNAPSHOTS = 120;
const TIMELINE_SNAPSHOT_INTERVAL = 0.12;
const MAX_TIMELINE_BYTES = 96 * 1024 * 1024;
const NOISE_SEED = 351107;

function revealUiWhenStyled(maxWaitMs = 1500): void {
  const start = performance.now();
  const tryReveal = (): void => {
    const styled = getComputedStyle(document.documentElement).getPropertyValue('--ui-size-scale').trim().length > 0;
    if (styled || performance.now() - start >= maxWaitMs) {
      document.documentElement.classList.add('ui-ready');
      return;
    }
    requestAnimationFrame(tryReveal);
  };
  tryReveal();
}

function requiredElement<T extends Element>(
  id: string,
  check: (element: Element) => element is T,
): T {
  const element = document.getElementById(id);
  if (!element || !check(element)) {
    throw new Error(`Required element #${id} was not found or has an unexpected type.`);
  }
  return element;
}

function isInput(element: Element): element is HTMLInputElement {
  return element instanceof HTMLInputElement;
}

function isSelect(element: Element): element is HTMLSelectElement {
  return element instanceof HTMLSelectElement;
}

function isButton(element: Element): element is HTMLButtonElement {
  return element instanceof HTMLButtonElement;
}

function isDiv(element: Element): element is HTMLDivElement {
  return element instanceof HTMLDivElement;
}

function isSpan(element: Element): element is HTMLSpanElement {
  return element instanceof HTMLSpanElement;
}

const ui: UiRefs = {
  panel: requiredElement('ui-panel', isDiv),
  handleTop: requiredElement('ui-handle', isDiv),
  handleBottom: requiredElement('ui-handle-bottom', isDiv),
  collapseToggle: requiredElement('collapse-toggle', isButton),
  start: requiredElement('start-sim', isButton),
  reset: requiredElement('reset-sim', isButton),
  growthSpeed: requiredElement('growth-speed', isInput),
  growthSpeedValue: requiredElement('growth-speed-value', isSpan),
  timeline: requiredElement('simulation-timeline', isInput),
  timelineValue: requiredElement('simulation-timeline-value', isSpan),
  emitterCountX: requiredElement('emitter-count-x', isInput),
  emitterCountXValue: requiredElement('emitter-count-x-value', isSpan),
  emitterCountY: requiredElement('emitter-count-y', isInput),
  emitterCountYValue: requiredElement('emitter-count-y-value', isSpan),
  emitterCountZ: requiredElement('emitter-count-z', isInput),
  emitterCountZValue: requiredElement('emitter-count-z-value', isSpan),
  emitterSpacingX: requiredElement('emitter-spacing-x', isInput),
  emitterSpacingXValue: requiredElement('emitter-spacing-x-value', isSpan),
  emitterSpacingY: requiredElement('emitter-spacing-y', isInput),
  emitterSpacingYValue: requiredElement('emitter-spacing-y-value', isSpan),
  emitterSpacingZ: requiredElement('emitter-spacing-z', isInput),
  emitterSpacingZValue: requiredElement('emitter-spacing-z-value', isSpan),
  trailLength: requiredElement('trail-length', isInput),
  trailLengthValue: requiredElement('trail-length-value', isSpan),
  generationDistance: requiredElement('generation-distance', isInput),
  generationDistanceValue: requiredElement('generation-distance-value', isSpan),
  trailThickness: requiredElement('trail-thickness', isInput),
  trailThicknessValue: requiredElement('trail-thickness-value', isSpan),
  noiseScale: requiredElement('noise-scale', isInput),
  noiseScaleValue: requiredElement('noise-scale-value', isSpan),
  noiseSpeed: requiredElement('noise-speed', isInput),
  noiseSpeedValue: requiredElement('noise-speed-value', isSpan),
  noiseStrength: requiredElement('noise-strength', isInput),
  noiseStrengthValue: requiredElement('noise-strength-value', isSpan),
  vorticity: requiredElement('vorticity', isInput),
  vorticityValue: requiredElement('vorticity-value', isSpan),
  attraction: requiredElement('attraction', isInput),
  attractionValue: requiredElement('attraction-value', isSpan),
  damping: requiredElement('damping', isInput),
  dampingValue: requiredElement('damping-value', isSpan),
  gradientType: requiredElement('gradient-type', isSelect),
  gradientStart: requiredElement('gradient-start-color', isInput),
  gradientEnd: requiredElement('gradient-end-color', isInput),
  curvatureContrast: requiredElement('curvature-contrast', isInput),
  curvatureContrastValue: requiredElement('curvature-contrast-value', isSpan),
  curvatureBias: requiredElement('curvature-bias', isInput),
  curvatureBiasValue: requiredElement('curvature-bias-value', isSpan),
  gradientBlur: requiredElement('gradient-blur', isInput),
  gradientBlurValue: requiredElement('gradient-blur-value', isSpan),
  fresnel: requiredElement('fresnel', isInput),
  fresnelValue: requiredElement('fresnel-value', isSpan),
  specular: requiredElement('specular', isInput),
  specularValue: requiredElement('specular-value', isSpan),
  bloom: requiredElement('bloom', isInput),
  bloomValue: requiredElement('bloom-value', isSpan),
  exportObj: requiredElement('export-obj', isButton),
  exportGlb: requiredElement('export-glb', isButton),
  exportScreenshot: requiredElement('export-screenshot', isButton),
};

const canvas = document.querySelector<HTMLCanvasElement>('#app-canvas');
if (!canvas) {
  throw new Error('Canvas #app-canvas was not found.');
}

revealUiWhenStyled();

const simulationSettings: SimulationSettings = {
  growthSpeed: Number.parseFloat(ui.growthSpeed.value),
};

const emitterSettings: EmitterSettings = {
  countX: Number.parseInt(ui.emitterCountX.value, 10),
  countY: Number.parseInt(ui.emitterCountY.value, 10),
  countZ: Number.parseInt(ui.emitterCountZ.value, 10),
  spacingX: Number.parseFloat(ui.emitterSpacingX.value),
  spacingY: Number.parseFloat(ui.emitterSpacingY.value),
  spacingZ: Number.parseFloat(ui.emitterSpacingZ.value),
};

const particleSettings: ParticleSettings = {
  trailLength: Number.parseInt(ui.trailLength.value, 10),
  generationDistance: Number.parseFloat(ui.generationDistance.value),
  trailThickness: Number.parseFloat(ui.trailThickness.value),
};

const growthSettings: GrowthSettings = {
  noiseScale: Number.parseFloat(ui.noiseScale.value),
  noiseSpeed: Number.parseFloat(ui.noiseSpeed.value),
  noiseStrength: Number.parseFloat(ui.noiseStrength.value),
  vorticity: Number.parseFloat(ui.vorticity.value),
  attraction: Number.parseFloat(ui.attraction.value),
  damping: Number.parseFloat(ui.damping.value),
};

const materialSettings: MaterialSettings = {
  gradientType: ui.gradientType.value as GradientType,
  gradientStart: ui.gradientStart.value,
  gradientEnd: ui.gradientEnd.value,
  curvatureContrast: Number.parseFloat(ui.curvatureContrast.value),
  curvatureBias: Number.parseFloat(ui.curvatureBias.value),
  gradientBlur: Number.parseFloat(ui.gradientBlur.value),
  fresnel: Number.parseFloat(ui.fresnel.value),
  specular: Number.parseFloat(ui.specular.value),
  bloom: Number.parseFloat(ui.bloom.value),
};

const appState: AppState = {
  running: false,
};

const renderer = new WebGLRenderer({ antialias: true, canvas });
const getPixelRatio = (): number => Math.min(window.devicePixelRatio * 1.5, 3);
renderer.setPixelRatio(getPixelRatio());
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = SRGBColorSpace;
renderer.toneMapping = ACESFilmicToneMapping;

const scene = new Scene();
scene.background = new Color(0x111622);

const camera = new PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.01, 100);
camera.position.set(0, 0.25, 4.2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = true;
controls.enableZoom = true;
controls.target.set(0, 0, 0);
controls.mouseButtons = {
  LEFT: -1 as unknown as MOUSE,
  MIDDLE: MOUSE.PAN,
  RIGHT: MOUSE.ROTATE,
};
controls.update();
renderer.domElement.addEventListener('contextmenu', (event) => event.preventDefault());
window.addEventListener('contextmenu', (event) => event.preventDefault());

const materialController = new MaterialController(materialSettings);
const engine = new SwarmTrailsEngine(emitterSettings, particleSettings, growthSettings, NOISE_SEED);
engine.setGradientBlur(materialSettings.gradientBlur);

let trailMeshGeometry = new BufferGeometry();
const trailMesh = new Mesh(trailMeshGeometry, materialController.material);
trailMesh.frustumCulled = false;
scene.add(trailMesh);

const MAX_EMITTER_MARKERS = 18 * 18 * 18;
const emitterMarkerGeometry = new BoxGeometry(0.015, 0.015, 0.015);
const emitterMarkerMaterial = new MeshBasicMaterial({
  color: 0xf6fbff,
  transparent: true,
  opacity: 0.9,
  depthWrite: false,
  depthTest: false,
});
const emitterMarkers = new InstancedMesh(
  emitterMarkerGeometry,
  emitterMarkerMaterial,
  MAX_EMITTER_MARKERS,
);
emitterMarkers.count = 0;
emitterMarkers.renderOrder = 2;
scene.add(emitterMarkers);
const markerMatrix = new Matrix4();

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(
  new Vector2(window.innerWidth, window.innerHeight),
  materialSettings.bloom,
  0.7,
  0.15,
);
composer.addPass(bloomPass);
const fxaaPass = new ShaderPass(FXAAShader);
fxaaPass.enabled = true;
composer.addPass(fxaaPass);

const timelineEntries: TimelineEntry[] = [];
let currentTimelineStep = 0;
let timelineSliderSyncing = false;
let timelineRangeBound = false;
let snapshotAccumulator = 0;
let maxTimelineEntries = MAX_TIMELINE_SNAPSHOTS;
let trailMeshDirty = true;
let emitterMarkersStartVisible = true;
let draggingPanel = false;
const dragOffset = { x: 0, y: 0 };

function updateRangeProgress(input: HTMLInputElement): void {
  const min = Number.parseFloat(input.min);
  const max = Number.parseFloat(input.max);
  const value = Number.parseFloat(input.value);
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min || !Number.isFinite(value)) {
    input.style.setProperty('--range-progress', '0%');
    return;
  }
  const progress = ((value - min) / (max - min)) * 100;
  input.style.setProperty('--range-progress', `${Math.min(100, Math.max(0, progress))}%`);
}

function bindRange(
  input: HTMLInputElement,
  valueLabel: HTMLSpanElement,
  format: (value: number) => string,
  onInput: (value: number) => void,
): void {
  const stepDecimals = (stepValue: string): number => {
    if (!stepValue || stepValue === 'any') {
      return 6;
    }
    const normalized = stepValue.toLowerCase();
    const expIndex = normalized.indexOf('e-');
    if (expIndex >= 0) {
      const expDigits = Number.parseInt(normalized.slice(expIndex + 2), 10);
      return Number.isFinite(expDigits) ? expDigits : 6;
    }
    const dotIndex = stepValue.indexOf('.');
    return dotIndex >= 0 ? stepValue.length - dotIndex - 1 : 0;
  };

  const commitManualValue = (rawValue: string): void => {
    let next = Number.parseFloat(rawValue);
    if (!Number.isFinite(next)) {
      update();
      return;
    }

    const min = Number.parseFloat(input.min);
    const max = Number.parseFloat(input.max);
    if (Number.isFinite(min)) {
      next = Math.max(min, next);
    }
    if (Number.isFinite(max)) {
      next = Math.min(max, next);
    }

    const parsedStep = Number.parseFloat(input.step);
    if (Number.isFinite(parsedStep) && parsedStep > 0) {
      const base = Number.isFinite(min) ? min : 0;
      next = base + Math.round((next - base) / parsedStep) * parsedStep;
      if (Number.isFinite(min)) {
        next = Math.max(min, next);
      }
      if (Number.isFinite(max)) {
        next = Math.min(max, next);
      }
    }

    input.value = next.toFixed(stepDecimals(input.step));
    update();
  };

  let isManualEditing = false;
  const beginManualEdit = (): void => {
    if (isManualEditing) {
      return;
    }
    isManualEditing = true;

    const editor = document.createElement('input');
    editor.type = 'number';
    editor.className = 'value-editor';
    editor.value = input.value;
    if (input.min) {
      editor.min = input.min;
    }
    if (input.max) {
      editor.max = input.max;
    }
    if (input.step) {
      editor.step = input.step;
    }

    valueLabel.replaceWith(editor);
    editor.focus();
    editor.select();

    let finalized = false;
    const finish = (commit: boolean): void => {
      if (finalized) {
        return;
      }
      finalized = true;
      const submitted = editor.value;
      editor.replaceWith(valueLabel);
      isManualEditing = false;
      if (commit) {
        commitManualValue(submitted);
      } else {
        update();
      }
    };

    editor.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        finish(true);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        finish(false);
      }
    });
    editor.addEventListener('blur', () => {
      finish(true);
    });
  };

  valueLabel.addEventListener('click', (event) => {
    event.stopPropagation();
    beginManualEdit();
  });

  const update = (): void => {
    const value = Number.parseFloat(input.value);
    valueLabel.textContent = format(value);
    updateRangeProgress(input);
    onInput(value);
  };

  input.addEventListener('input', update);
  update();
}
function bindSectionCollapseToggles(): void {
  const headers = ui.panel.querySelectorAll<HTMLDivElement>('.panel-section-header');
  headers.forEach((header) => {
    const section = header.closest('.panel-section');
    if (!section) {
      return;
    }

    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', section.classList.contains('is-collapsed') ? 'false' : 'true');

    const toggle = (): void => {
      const collapsed = section.classList.toggle('is-collapsed');
      header.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    };

    header.addEventListener('click', toggle);
    header.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      }
    });
  });
}

function bindCustomSelect(select: HTMLSelectElement): void {
  const control = select.closest('.select-control');
  const shell = control?.querySelector('.select-shell');
  if (!control || !shell) {
    return;
  }
  select.classList.add('native-select-hidden');

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'select-trigger';
  trigger.id = `${select.id}-trigger`;
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');

  const menu = document.createElement('ul');
  menu.className = 'select-menu';
  menu.id = `${select.id}-menu`;
  menu.hidden = true;
  menu.setAttribute('role', 'listbox');
  menu.setAttribute('aria-labelledby', trigger.id);

  type OptionButton = HTMLButtonElement & { dataset: DOMStringMap & { value: string; index: string } };
  const optionButtons: OptionButton[] = [];
  const optionValues = Array.from(select.options).map((option) => option.value);

  const buildOptionButton = (index: number, label: string, value: string): OptionButton => {
    const item = document.createElement('li');
    const button = document.createElement('button') as OptionButton;
    button.type = 'button';
    button.className = 'select-option';
    button.dataset.value = value;
    button.dataset.index = `${index}`;
    button.textContent = label;
    button.setAttribute('role', 'option');
    item.appendChild(button);
    menu.appendChild(item);
    return button;
  };

  Array.from(select.options).forEach((option, index) => {
    const button = buildOptionButton(index, option.textContent ?? option.value, option.value);
    optionButtons.push(button);
  });

  let activeIndex = Math.max(0, optionValues.indexOf(select.value));

  const setOpen = (open: boolean): void => {
    control.classList.toggle('is-open', open);
    menu.hidden = !open;
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  const updateSelectionUi = (): void => {
    const selectedIndex = Math.max(0, optionValues.indexOf(select.value));
    const selectedButton = optionButtons[selectedIndex];
    trigger.textContent = selectedButton?.textContent ?? select.value;
    optionButtons.forEach((button, index) => {
      const selected = index === selectedIndex;
      const active = index === activeIndex;
      button.classList.toggle('is-selected', selected);
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', selected ? 'true' : 'false');
      button.tabIndex = active ? 0 : -1;
    });
  };

  const setActiveIndex = (index: number): void => {
    if (optionButtons.length === 0) {
      return;
    }
    const count = optionButtons.length;
    activeIndex = ((index % count) + count) % count;
    updateSelectionUi();
  };

  const chooseIndex = (index: number): void => {
    const nextValue = optionValues[index];
    if (nextValue === undefined) {
      return;
    }
    const changed = select.value !== nextValue;
    select.value = nextValue;
    activeIndex = index;
    updateSelectionUi();
    setOpen(false);
    if (changed) {
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  const openMenu = (focusOption = false): void => {
    setActiveIndex(Math.max(0, optionValues.indexOf(select.value)));
    setOpen(true);
    if (focusOption) {
      optionButtons[activeIndex]?.focus();
    }
  };

  select.addEventListener('change', () => {
    activeIndex = Math.max(0, optionValues.indexOf(select.value));
    updateSelectionUi();
    setOpen(false);
  });

  trigger.addEventListener('click', () => {
    if (control.classList.contains('is-open')) {
      setOpen(false);
    } else {
      openMenu();
    }
  });

  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!control.classList.contains('is-open')) {
        openMenu(true);
      } else {
        setActiveIndex(activeIndex + 1);
        optionButtons[activeIndex]?.focus();
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!control.classList.contains('is-open')) {
        openMenu(true);
      } else {
        setActiveIndex(activeIndex - 1);
        optionButtons[activeIndex]?.focus();
      }
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (control.classList.contains('is-open')) {
        chooseIndex(activeIndex);
      } else {
        openMenu(true);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    }
  });

  optionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number.parseInt(button.dataset.index, 10);
      chooseIndex(index);
      trigger.focus();
    });
    button.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex(activeIndex + 1);
        optionButtons[activeIndex]?.focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex(activeIndex - 1);
        optionButtons[activeIndex]?.focus();
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        chooseIndex(activeIndex);
        trigger.focus();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        trigger.focus();
      } else if (event.key === 'Tab') {
        setOpen(false);
      }
    });
  });

  document.addEventListener('pointerdown', (event) => {
    const target = event.target;
    if (!(target instanceof Node) || !control.contains(target)) {
      setOpen(false);
    }
  });

  shell.prepend(menu);
  shell.prepend(trigger);
  updateSelectionUi();
}

function setStartButtonState(running: boolean): void {
  ui.start.textContent = running ? 'Pause' : 'Start';
  ui.start.classList.toggle('is-stop-state', running);
  ui.start.classList.toggle('is-start-state', !running);
}

function syncEmitterMarkerVisibility(): void {
  emitterMarkers.visible = emitterMarkersStartVisible && !appState.running;
}

function rebuildEmitterMarkers(): void {
  const origins = engine.getEmitterOrigins();
  const count = Math.min(Math.floor(origins.length / 3), MAX_EMITTER_MARKERS);
  for (let i = 0; i < count; i += 1) {
    const read = i * 3;
    markerMatrix.makeTranslation(origins[read], origins[read + 1], origins[read + 2]);
    emitterMarkers.setMatrixAt(i, markerMatrix);
  }
  emitterMarkers.count = count;
  emitterMarkers.instanceMatrix.needsUpdate = true;
  syncEmitterMarkerVisibility();
}

function syncEngineGeometryReference(): void {
  trailMeshDirty = true;
}

function updateTrailMeshGeometry(): void {
  if (!trailMeshDirty) {
    return;
  }
  trailMeshDirty = false;
  const state = engine.getTrailStateView();
  const nextGeometry = buildTrailMeshGeometry(state, particleSettings, materialSettings);
  trailMeshGeometry.dispose();
  trailMeshGeometry = nextGeometry;
  trailMesh.geometry = trailMeshGeometry;
}

function syncTimelineSliderState(): void {
  const minStep = timelineEntries.length > 0 ? timelineEntries[0].step : 0;
  const maxStep = timelineEntries.length > 0 ? timelineEntries[timelineEntries.length - 1].step : 0;
  ui.timeline.min = `${minStep}`;
  ui.timeline.max = `${maxStep}`;
  currentTimelineStep = Math.min(maxStep, Math.max(minStep, currentTimelineStep));
  ui.timeline.disabled = appState.running || minStep === maxStep;

  if (timelineRangeBound) {
    timelineSliderSyncing = true;
    ui.timeline.value = `${currentTimelineStep}`;
    ui.timeline.dispatchEvent(new Event('input', { bubbles: true }));
    timelineSliderSyncing = false;
    return;
  }

  ui.timeline.value = `${currentTimelineStep}`;
  ui.timelineValue.textContent = `${currentTimelineStep}`;
  updateRangeProgress(ui.timeline);
}

function estimateSnapshotBytes(snapshot: SwarmSnapshot): number {
  return (
    snapshot.heads.byteLength +
    snapshot.velocities.byteLength +
    snapshot.travel.byteLength +
    snapshot.trailPoints.byteLength +
    snapshot.headIndices.byteLength +
    snapshot.filledLengths.byteLength
  );
}

function updateTimelineCapacity(snapshot: SwarmSnapshot): void {
  const bytes = estimateSnapshotBytes(snapshot);
  if (bytes <= 0) {
    maxTimelineEntries = MAX_TIMELINE_SNAPSHOTS;
    return;
  }
  const capped = Math.floor(MAX_TIMELINE_BYTES / bytes);
  maxTimelineEntries = Math.max(2, Math.min(MAX_TIMELINE_SNAPSHOTS, capped));
}

function resetTimelineToCurrentState(): void {
  timelineEntries.length = 0;
  currentTimelineStep = 0;
  const snapshot = engine.exportSnapshot();
  updateTimelineCapacity(snapshot);
  timelineEntries.push({
    step: currentTimelineStep,
    snapshot,
  });
  snapshotAccumulator = 0;
  syncTimelineSliderState();
}

function trimTimelineFutureFromCurrentStep(): void {
  let keepIndex = -1;
  for (let i = 0; i < timelineEntries.length; i += 1) {
    if (timelineEntries[i].step === currentTimelineStep) {
      keepIndex = i;
      break;
    }
  }
  if (keepIndex < 0 || keepIndex >= timelineEntries.length - 1) {
    return;
  }
  timelineEntries.splice(keepIndex + 1);
}

function appendTimelineStepFromCurrentState(): void {
  trimTimelineFutureFromCurrentStep();

  const snapshot = engine.exportSnapshot();
  updateTimelineCapacity(snapshot);
  const nextStep = currentTimelineStep + 1;
  timelineEntries.push({
    step: nextStep,
    snapshot,
  });
  currentTimelineStep = nextStep;

  while (timelineEntries.length > maxTimelineEntries) {
    timelineEntries.shift();
  }

  syncTimelineSliderState();
}

function seekTimelineStep(step: number): void {
  let target: TimelineEntry | null = null;
  for (let i = 0; i < timelineEntries.length; i += 1) {
    if (timelineEntries[i].step === step) {
      target = timelineEntries[i];
      break;
    }
  }
  if (!target) {
    return;
  }

  engine.importSnapshot(target.snapshot);
  syncEngineGeometryReference();
  currentTimelineStep = target.step;
  syncTimelineSliderState();
}

function startSimulation(): void {
  appState.running = true;
  emitterMarkersStartVisible = false;
  setStartButtonState(true);
  syncEmitterMarkerVisibility();
  syncTimelineSliderState();
}

function stopSimulation(): void {
  appState.running = false;
  setStartButtonState(false);
  syncEmitterMarkerVisibility();
  syncTimelineSliderState();
}

function resetSimulation(): void {
  if (appState.running) {
    stopSimulation();
  }
  engine.reset();
  emitterMarkersStartVisible = true;
  syncEngineGeometryReference();
  syncEmitterMarkerVisibility();
  resetTimelineToCurrentState();
}

function applyEmitterAndParticleSettings(forceReset = false): void {
  engine.setEmitterSettings(emitterSettings);
  engine.setParticleSettings(particleSettings);
  syncEngineGeometryReference();
  rebuildEmitterMarkers();
  if (forceReset || !appState.running) {
    resetSimulation();
  }
}

function clampPanelToViewport(): void {
  const panelRect = ui.panel.getBoundingClientRect();
  const width = panelRect.width;
  const height = panelRect.height;
  const left = Number.parseFloat(ui.panel.style.left || '0');
  const top = Number.parseFloat(ui.panel.style.top || '0');
  const maxLeft = Math.max(0, window.innerWidth - width);
  const maxTop = Math.max(0, window.innerHeight - height);
  const clampedLeft = Math.min(maxLeft, Math.max(0, left));
  const clampedTop = Math.min(maxTop, Math.max(0, top));
  ui.panel.style.left = `${clampedLeft}px`;
  ui.panel.style.top = `${clampedTop}px`;
}

function handleResize(): void {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setPixelRatio(getPixelRatio());
  renderer.setSize(width, height);
  composer.setSize(width, height);
  bloomPass.setSize(width, height);
  fxaaPass.material.uniforms.resolution.value.set(1 / Math.max(width, 1), 1 / Math.max(height, 1));
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  clampPanelToViewport();
}
function getTrailMeshExportGeometry(): BufferGeometry | null {
  if (trailMeshDirty) {
    updateTrailMeshGeometry();
  }
  const geometry = trailMesh.geometry as BufferGeometry;
  const position = geometry.getAttribute('position') as BufferAttribute | undefined;
  if (!position || position.count < 3) {
    return null;
  }
  return geometry;
}

function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}

function downloadObj(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  downloadBlob(filename, blob);
}

function downloadBinary(filename: string, data: ArrayBuffer, mimeType: string): void {
  const blob = new Blob([data], { type: mimeType });
  downloadBlob(filename, blob);
}

function exportScreenshot(filename: string): void {
  composer.render();
  renderer.domElement.toBlob((blob) => {
    if (!blob) {
      console.error('Screenshot export failed: unable to encode canvas as PNG.');
      return;
    }
    downloadBlob(filename, blob);
  }, 'image/png');
}

function exportCurrentTrailsAsGlb(filename: string): void {
  const sourceGeometry = getTrailMeshExportGeometry();
  if (!sourceGeometry) {
    console.warn('GLB export skipped: not enough mesh geometry.');
    return;
  }

  const exportGeometry = sourceGeometry.clone();
  const exportMaterial = new MeshBasicMaterial({ vertexColors: true });
  const exportMesh = new Mesh(exportGeometry, exportMaterial);
  exportMesh.name = 'SwarmTrails';

  const cleanup = (): void => {
    exportGeometry.dispose();
    exportMaterial.dispose();
  };

  const exporter = new GLTFExporter();
  exporter.parse(
    exportMesh,
    (result) => {
      if (result instanceof ArrayBuffer) {
        downloadBinary(filename, result, 'model/gltf-binary');
      } else {
        console.error('GLB export expected binary output but received JSON.');
      }
      cleanup();
    },
    (error) => {
      console.error('GLB export failed.', error);
      cleanup();
    },
    { binary: true, onlyVisible: false },
  );
}

bindSectionCollapseToggles();
bindCustomSelect(ui.gradientType);

bindRange(ui.growthSpeed, ui.growthSpeedValue, (value) => value.toFixed(2), (value) => {
  simulationSettings.growthSpeed = value;
});
bindRange(ui.timeline, ui.timelineValue, (value) => `${Math.round(value)}`, (value) => {
  if (timelineSliderSyncing || appState.running) {
    return;
  }
  const requestedStep = Math.round(value);
  if (requestedStep === currentTimelineStep) {
    return;
  }
  seekTimelineStep(requestedStep);
});
timelineRangeBound = true;

bindRange(ui.emitterCountX, ui.emitterCountXValue, (value) => `${Math.round(value)}`, (value) => {
  emitterSettings.countX = Math.round(value);
  applyEmitterAndParticleSettings(true);
});
bindRange(ui.emitterCountY, ui.emitterCountYValue, (value) => `${Math.round(value)}`, (value) => {
  emitterSettings.countY = Math.round(value);
  applyEmitterAndParticleSettings(true);
});
bindRange(ui.emitterCountZ, ui.emitterCountZValue, (value) => `${Math.round(value)}`, (value) => {
  emitterSettings.countZ = Math.round(value);
  applyEmitterAndParticleSettings(true);
});
bindRange(ui.emitterSpacingX, ui.emitterSpacingXValue, (value) => value.toFixed(2), (value) => {
  emitterSettings.spacingX = value;
  applyEmitterAndParticleSettings(true);
});
bindRange(ui.emitterSpacingY, ui.emitterSpacingYValue, (value) => value.toFixed(2), (value) => {
  emitterSettings.spacingY = value;
  applyEmitterAndParticleSettings(true);
});
bindRange(ui.emitterSpacingZ, ui.emitterSpacingZValue, (value) => value.toFixed(2), (value) => {
  emitterSettings.spacingZ = value;
  applyEmitterAndParticleSettings(true);
});

bindRange(ui.trailLength, ui.trailLengthValue, (value) => `${Math.round(value)}`, (value) => {
  particleSettings.trailLength = Math.round(value);
  applyEmitterAndParticleSettings(true);
});
bindRange(ui.generationDistance, ui.generationDistanceValue, (value) => value.toFixed(3), (value) => {
  particleSettings.generationDistance = value;
  engine.setParticleSettings(particleSettings);
});
bindRange(ui.trailThickness, ui.trailThicknessValue, (value) => value.toFixed(2), (value) => {
  particleSettings.trailThickness = value;
  trailMeshDirty = true;
});
bindRange(ui.noiseScale, ui.noiseScaleValue, (value) => value.toFixed(2), (value) => {
  growthSettings.noiseScale = value;
  engine.setGrowthSettings(growthSettings);
});
bindRange(ui.noiseSpeed, ui.noiseSpeedValue, (value) => value.toFixed(2), (value) => {
  growthSettings.noiseSpeed = value;
  engine.setGrowthSettings(growthSettings);
});
bindRange(ui.noiseStrength, ui.noiseStrengthValue, (value) => value.toFixed(2), (value) => {
  growthSettings.noiseStrength = value;
  engine.setGrowthSettings(growthSettings);
});
bindRange(ui.vorticity, ui.vorticityValue, (value) => value.toFixed(2), (value) => {
  growthSettings.vorticity = value;
  engine.setGrowthSettings(growthSettings);
});
bindRange(ui.attraction, ui.attractionValue, (value) => value.toFixed(2), (value) => {
  growthSettings.attraction = value;
  engine.setGrowthSettings(growthSettings);
});
bindRange(ui.damping, ui.dampingValue, (value) => value.toFixed(3), (value) => {
  growthSettings.damping = value;
  engine.setGrowthSettings(growthSettings);
});

bindRange(ui.curvatureContrast, ui.curvatureContrastValue, (value) => value.toFixed(2), (value) => {
  materialSettings.curvatureContrast = value;
  materialController.setMaterialSettings(materialSettings);
  trailMeshDirty = true;
});
bindRange(ui.curvatureBias, ui.curvatureBiasValue, (value) => value.toFixed(2), (value) => {
  materialSettings.curvatureBias = value;
  materialController.setMaterialSettings(materialSettings);
  trailMeshDirty = true;
});
bindRange(ui.gradientBlur, ui.gradientBlurValue, (value) => value.toFixed(2), (value) => {
  materialSettings.gradientBlur = value;
  engine.setGradientBlur(value);
  trailMeshDirty = true;
});
bindRange(ui.fresnel, ui.fresnelValue, (value) => value.toFixed(2), (value) => {
  materialSettings.fresnel = value;
  materialController.setMaterialSettings(materialSettings);
});
bindRange(ui.specular, ui.specularValue, (value) => value.toFixed(2), (value) => {
  materialSettings.specular = value;
  materialController.setMaterialSettings(materialSettings);
});
bindRange(ui.bloom, ui.bloomValue, (value) => value.toFixed(2), (value) => {
  materialSettings.bloom = value;
  bloomPass.strength = value;
});

ui.gradientStart.addEventListener('input', () => {
  materialSettings.gradientStart = ui.gradientStart.value;
  materialController.setMaterialSettings(materialSettings);
  trailMeshDirty = true;
});
ui.gradientEnd.addEventListener('input', () => {
  materialSettings.gradientEnd = ui.gradientEnd.value;
  materialController.setMaterialSettings(materialSettings);
  trailMeshDirty = true;
});
ui.gradientType.addEventListener('change', () => {
  materialSettings.gradientType = ui.gradientType.value as GradientType;
  materialController.setMaterialSettings(materialSettings);
  trailMeshDirty = true;
});

ui.exportObj.addEventListener('click', () => {
  const geometry = getTrailMeshExportGeometry();
  if (!geometry) {
    console.warn('OBJ export skipped: not enough mesh geometry.');
    return;
  }
  const obj = buildObjMeshWithVertexColors(geometry);
  downloadObj(`swarm-trails-step-${currentTimelineStep}.obj`, obj);
});

ui.exportGlb.addEventListener('click', () => {
  exportCurrentTrailsAsGlb(`swarm-trails-step-${currentTimelineStep}.glb`);
});

ui.exportScreenshot.addEventListener('click', () => {
  exportScreenshot(`swarm-trails-step-${currentTimelineStep}.png`);
});

ui.start.addEventListener('click', () => {
  if (appState.running) {
    stopSimulation();
  } else {
    startSimulation();
  }
});

ui.reset.addEventListener('click', () => {
  resetSimulation();
});

ui.collapseToggle.addEventListener('pointerdown', (event) => {
  event.stopPropagation();
});
ui.collapseToggle.addEventListener('click', () => {
  const collapsed = ui.panel.classList.toggle('is-collapsed');
  ui.collapseToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
});

const beginPanelDrag = (event: PointerEvent): void => {
  if (event.target instanceof Element && event.target.closest('.collapse-button')) {
    return;
  }
  draggingPanel = true;
  const rect = ui.panel.getBoundingClientRect();
  ui.panel.style.left = `${rect.left}px`;
  ui.panel.style.top = `${rect.top}px`;
  ui.panel.style.right = 'auto';
  ui.panel.style.bottom = 'auto';
  dragOffset.x = event.clientX - rect.left;
  dragOffset.y = event.clientY - rect.top;
};

ui.handleTop.addEventListener('pointerdown', beginPanelDrag);
ui.handleBottom.addEventListener('pointerdown', beginPanelDrag);
window.addEventListener('pointermove', (event) => {
  if (!draggingPanel) {
    return;
  }
  const x = event.clientX - dragOffset.x;
  const y = event.clientY - dragOffset.y;
  ui.panel.style.left = `${x}px`;
  ui.panel.style.top = `${y}px`;
  clampPanelToViewport();
});
window.addEventListener('pointerup', () => {
  draggingPanel = false;
});
window.addEventListener('pointercancel', () => {
  draggingPanel = false;
});

window.addEventListener('resize', handleResize);

setStartButtonState(false);
rebuildEmitterMarkers();
resetTimelineToCurrentState();

let lastTime = performance.now();
renderer.setAnimationLoop((now) => {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  controls.update();

  if (appState.running) {
    engine.step(dt, simulationSettings.growthSpeed);
    syncEngineGeometryReference();

    snapshotAccumulator += dt;
    if (snapshotAccumulator >= TIMELINE_SNAPSHOT_INTERVAL) {
      snapshotAccumulator = 0;
      appendTimelineStepFromCurrentState();
    }
  }

  updateTrailMeshGeometry();
  composer.render();
});

syncTimelineSliderState();
handleResize();
