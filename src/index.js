import MapboxDraw from '@mapbox/mapbox-gl-draw';

import { SnapPolygonMode, SnapPointMode, SnapLineMode, SnapModeDrawStyles } from 'mapbox-gl-draw-snap-mode';
import mapboxGlDrawPinningMode from 'mapbox-gl-draw-pinning-mode';
import mapboxGlDrawPassingMode from 'mapbox-gl-draw-passing-mode';
import { SRMode, SRCenter, SRStyle } from 'mapbox-gl-draw-scale-rotate-mode';
import CutPolygonMode from 'mapbox-gl-draw-cut-polygon-mode';
import SplitPolygonMode from 'mapbox-gl-draw-split-polygon-mode';
import SplitLineMode from 'mapbox-gl-draw-split-line-mode';
import { additionalTools, measurement, addToolStyle } from 'mapbox-gl-draw-additional-tools';

import './index.css';
class SnapOptionsToolbar {
    constructor(opt) {
        let ctrl = this;
        ctrl.checkboxes = opt.checkboxes || [];
        ctrl.onRemoveOrig = opt.draw.onRemove;
    }
    onAdd(map) {
        let ctrl = this;
        ctrl.map = map;
        ctrl._container = document.createElement('div');
        ctrl._container.className = 'mapboxgl-ctrl-group mapboxgl-ctrl';
        ctrl.elContainer = ctrl._container;
        ctrl.checkboxes.forEach((b) => {
            ctrl.addCheckbox(b);
        });
        return ctrl._container;
    }
    onRemove(map) {
        ctrl.checkboxes.forEach((b) => {
            ctrl.removeButton(b);
        });
        ctrl.onRemoveOrig(map);
    }
    addCheckbox(opt) {
        let ctrl = this;
        var elCheckbox = document.createElement('input');
        elCheckbox.setAttribute('type', 'checkbox');
        elCheckbox.setAttribute('title', opt.title);
        elCheckbox.checked = opt.initialState === 'checked';
        elCheckbox.className = 'mapbox-gl-draw_ctrl-draw-btn';
        if (opt.classes instanceof Array) {
            opt.classes.forEach((c) => {
                elCheckbox.classList.add(c);
            });
        }
        elCheckbox.addEventListener(opt.on, opt.action);
        ctrl.elContainer.appendChild(elCheckbox);
        opt.elCheckbox = elCheckbox;
    }
    removeButton(opt) {
        opt.elCheckbox.removeEventListener(opt.on, opt.action);
        opt.elCheckbox.remove();
    }
}

export default class MapboxDrawPro extends MapboxDraw {
    constructor(options) {
        options = options || {};
        const { modes, styles, otherOtions } = options;

        const customModes = {
            ...MapboxDraw.modes,
            draw_point: SnapPointMode,
            draw_polygon: SnapPolygonMode,
            draw_line_string: SnapLineMode,
            pinning_mode: mapboxGlDrawPinningMode,
            passing_mode_point: mapboxGlDrawPassingMode(MapboxDraw.modes.draw_point),
            passing_mode_line_string: mapboxGlDrawPassingMode(MapboxDraw.modes.draw_line_string),
            passing_mode_polygon: mapboxGlDrawPassingMode(MapboxDraw.modes.draw_polygon),
            scaleRotateMode: SRMode,
            cutPolygonMode: CutPolygonMode,
            splitPolygonMode: SplitPolygonMode,
            splitLineMode: SplitLineMode,
        };

        const customOptions = {
            bufferSize: 0.5,
            bufferUnit: 'kilometers',
            bufferSteps: 64,
            snap: true,
            // snapOptions: {
            //   snapPx: 15,
            //   snapToMidPoints: true,
            // },
            guides: false,
            userProperties: true,
        };

        const _modes = { ...customModes, ...modes };
        const _options = { modes: _modes, ...customOptions, ...otherOtions };

        super(_options);

        this.buttons = [
            {
                on: 'click',
                action: () => {
                    try {
                        draw.changeMode('splitLineMode', {
                            spliter: prompt('Which Mode? (point, line_string, polygon)'),
                        });
                    } catch (err) {
                        alert(err.message);
                        console.error(err);
                    }
                },
                classes: ['split-line'],
            },
            {
                on: 'click',
                action: () => {
                    try {
                        draw.changeMode('splitPolygonMode');
                    } catch (err) {
                        alert(err.message);
                        console.error(err);
                    }
                },
                classes: ['split-polygon'],
            },
            {
                on: 'click',
                action: () => {
                    try {
                        draw.changeMode('cutPolygonMode');
                    } catch (err) {
                        alert(err.message);
                        console.error(err);
                    }
                },
                classes: ['cut-polygon'],
            },
            {
                on: 'click',
                action: () => {
                    try {
                        draw.changeMode('scaleRotateMode', {
                            // required
                            canScale: true,
                            canRotate: true, // only rotation enabled
                            canTrash: false, // disable feature delete

                            rotatePivot: SRCenter.Center, // rotate around center
                            scaleCenter: SRCenter.Opposite, // scale around opposite vertex

                            singleRotationPoint: true, // only one rotation point
                            rotationPointRadius: 1.2, // offset rotation point

                            canSelectFeatures: true,
                        });
                    } catch (err) {
                        alert(err.message);
                        console.error(err);
                    }
                },
                classes: ['rotate-icon'],
            },
            {
                on: 'click',
                action: () => {
                    draw.changeMode('pinning_mode');
                },
                classes: ['pinning_mode'],
                title: 'Pinning Mode tool',
            },
            // {
            //     on: 'click',
            //     action: () => {
            //         draw.changeMode('passing_mode_point');
            //     },
            //     classes: ['passing_mode', 'point'],
            //     title: 'Passing-Point tool',
            // },
            // {
            //     on: 'click',
            //     action: () => {
            //         draw.changeMode('passing_mode_line_string', (info) => {
            //             console.log(info);
            //         });
            //     },
            //     classes: ['passing_mode', 'line'],
            //     title: 'Passing-LineString tool',
            // },
            // {
            //     on: 'click',
            //     action: () => {
            //         draw.changeMode('passing_mode_polygon');
            //     },
            //     classes: ['passing_mode', 'polygon'],
            //     title: 'Passing-Polygon tool',
            // },
        ];

        this.onAddOrig = this.onAdd;
        this.onRemoveOrig = this.onRemove;

        const addOtherControls = async (map, draw, placement) => {
            const snapOptionsBar = new SnapOptionsToolbar({
                draw,
                checkboxes: [
                    {
                        on: 'change',
                        action: (e) => {
                            draw.options.snap = e.target.checked;
                        },
                        classes: ['snap_mode', 'snap'],
                        title: 'Snap when Draw',
                        initialState: 'checked',
                    },
                    {
                        on: 'change',
                        action: (e) => {
                            draw.options.guides = e.target.checked;
                        },
                        classes: ['snap_mode', 'grid'],
                        title: 'Show Guides',
                    },
                ],
            });

            setTimeout(() => {
                map.addControl(additionalTools(draw), placement);
                map.addControl(snapOptionsBar, placement);
            }, 400);
        };

        this.onAdd = (map, placement) => {
            this.map = map;
            this.elContainer = this.onAddOrig(map, placement);

            this.buttons.forEach((b) => {
                this.addButton(b);
            });

            addOtherControls(map, this, placement);
            return this.elContainer;
        };

        this.onRemove = (map) => {
            this.buttons.forEach((b) => {
                this.removeButton(b);
            });
            this.onRemoveOrig(map);
        };

        this.addButton = (opt) => {
            var elButton = document.createElement('button');
            elButton.className = 'mapbox-gl-draw_ctrl-draw-btn';
            elButton.setAttribute('title', opt.title);
            if (opt.classes instanceof Array) {
                opt.classes.forEach((c) => {
                    elButton.classList.add(c);
                });
            }
            elButton.addEventListener(opt.on, opt.action);
            this.elContainer.appendChild(elButton);
            opt.elButton = elButton;
        };

        this.removeButton = (opt) => {
            opt.elButton.removeEventListener(opt.on, opt.action);
            opt.elButton.remove();
        };
    }
}
