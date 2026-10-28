"use strict"

const jscad = require('@jscad/modeling')

const {
    cube,
    cylinder,
    sphere,
    cylinderElliptic,
    circle,
    cuboid,
    roundedCuboid,
    roundedCylinder,
    roundedRectangle,
    rectangle,
    triangle,
} = jscad.primitives

const {
    align,
    translate,
    rotate,
    mirror
} = jscad.transforms

const {
    intersect,
    subtract,
    union,
    scission
} = jscad.booleans

const {
    extrudeLinear,
    extrudeRotate,
    project
} = jscad.extrusions

const {
    measureDimensions,
    measureBoundingBox,
    measureVolume
} = jscad.measurements

const {
    hull,
    hullChain
} = jscad.hulls

const { vectorText } = jscad.text
const { toOutlines } = jscad.geometries.geom2
const { TAU } = jscad.maths.constants
const { colorize } = jscad.colors

const swcadJs = require('swcad-js').init({ jscad });

const reinforcedMeshPanelModule = require('./src/index.js')
const reinforcedMeshPanel = reinforcedMeshPanelModule.init({ jscad, swcadJs })

const inchesToMm = (numIn) => numIn * 25.4


//==============================================================================


/* ----------------------------------------
 * Test subjects
 * ------------------------------------- */

const baseMesh = reinforcedMeshPanel.baseMeshPanel({
    size: [inchesToMm(4), inchesToMm(4), inchesToMm(1 / 8)],
    reinforcementThickness: [5, 4, 3],
    meshEdgeMargin: inchesToMm(1 / 8),
    meshHoleRadius: inchesToMm(1 / 8),
    meshHoleDistance: inchesToMm(5 / 16),
})[0]

const baseReinf = reinforcedMeshPanel.basePanelReinforcement({
    size: [inchesToMm(4), inchesToMm(4), inchesToMm(1 / 8)],
    reinforcementThickness: [5, 4, 3],
    meshEdgeMargin: inchesToMm(1 / 8),
    meshHoleRadius: inchesToMm(1 / 8),
    meshHoleDistance: inchesToMm(5 / 16),
})[0]

const reinfMeshPanel1 = reinforcedMeshPanel.reinforcedMeshPanel({
    size: [inchesToMm(4), inchesToMm(4), inchesToMm(1 / 8)],
    reinforcementThickness: [5, 4, 3],
    meshEdgeMargin: inchesToMm(1 / 8),
    meshHoleRadius: inchesToMm(1 / 8),
    meshHoleDistance: inchesToMm(5 / 16),
    reinforcementPattern: 'cross',
})[0]

const reinfMeshPanel2 = reinforcedMeshPanel.reinforcedMeshPanel({
    size: [inchesToMm(6), inchesToMm(3), inchesToMm(1 / 8)],
    reinforcementThickness: [5, 4, 3],
    meshEdgeMargin: inchesToMm(1 / 8),
    meshHoleRadius: inchesToMm(1 / 8),
    meshHoleDistance: inchesToMm(5 / 16),
    meshHolePattern: 'square',
})[0]



//==============================================================================




/**
 * Main function to be rendered by JSCAD
 * @returns `geom3` or `geom3[]`
 */
function main() {
    const spaceUnit = inchesToMm(5)

    // return [
    //     translate([spaceUnit * 0, spaceUnit * 0, spaceUnit * 0], baseMesh),
    //     translate([spaceUnit * 1, spaceUnit * 0, spaceUnit * 0], baseReinf),
    // ]

    return [
        translate([spaceUnit * 0, spaceUnit * 0, spaceUnit * 0], reinfMeshPanel1),
        translate([spaceUnit * 0, spaceUnit * 1, spaceUnit * 0], reinfMeshPanel2),
    ]
}


module.exports = {
    main,
}
