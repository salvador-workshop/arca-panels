"use strict"

const dowelHolderLineInit = ({ jscad, swcadJs }) => {
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

    const {
        constants,
        standards,
    } = swcadJs.data

    const {
        math,
        position,
        geometry,
    } = swcadJs.calcs

    const {
        beadsBits,
        componentLine,
        fittings,
    } = swcadJs.components

    const distBetweenPoints = (startPt, endPt) => {
        const coordDiffs = [
            endPt[0] - startPt[0],
            endPt[1] - startPt[1],
        ]
        const lineLength = Math.hypot(coordDiffs[0], coordDiffs[1])
        return lineLength
    }

    const midPtBetweenPoints = (startPt, endPt) => {
        const coordDiffs = [
            endPt[0] - startPt[0],
            endPt[1] - startPt[1],
        ]
        const midPt = [
            startPt[0] + (coordDiffs[0] / 2),
            startPt[1] + (coordDiffs[1] / 2),
        ]

        return midPt
    }


    //==============================================================================


    const dowelHolderLineDefaults = () => {
        /* ----------------------------------------
         * Options / Properties -- Default Values
         * ------------------------------------- */

        /** Specific value declarations */
        const defaultValues = {
            opts: {
                type: standards.types.TYPE_DEFAULT,
                scale: 1,
                flip: false,
            },
            dims: {
                dowelDiam: 3.25,
                dowelRadius: 3.25 / 2,
                dowelHolderLength: math.inchesToMm(1 / 4),
                unitLength: math.inchesToMm(1),
                endOffset: math.inchesToMm(5 / 16),
                interfaceThickness: standards.INTERFACE_THICKNESS,
                fitGap: standards.FIT_GAP,
            },
            points: {
                centre: [0, 0],
                startPt: [math.inchesToMm(0.5), math.inchesToMm(0.5)],
                endPt: [math.inchesToMm(3), math.inchesToMm(4)],
            }
        }


        /* ----------------------------------------
         * Options / Properties -- Input Handling
         * ------------------------------------- */

        /** Options used by SW models */
        const standardOpts = {
            type: defaultValues.opts.type,
            scale: defaultValues.opts.scale,
            interfaceThickness: defaultValues.dims.interfaceThickness,
            fitGap: defaultValues.dims.fitGap,
        }

        /** Computed values for option defaults */
        const optDefaultValues = {
            ...standardOpts,
            startPt: defaultValues.points.startPt,
            endPt: defaultValues.points.endPt,
            dowelRadius: defaultValues.dims.dowelRadius,
            dowelHolderLength: defaultValues.dims.dowelHolderLength,
            unitLength: defaultValues.dims.unitLength,
            endOffset: defaultValues.dims.endOffset,
            baseLineOffset: defaultValues.dims.dowelRadius,
            flip: defaultValues.opts.flip,
        }


        return {
            vals: defaultValues,
            opts: optDefaultValues,
        }
    }


    const dowelHolderLineOpts = (opts) => {
        const defaults = dowelHolderLineDefaults()
        console.log('dowelHolderLineOpts() -- opts', opts)

        // User options
        const {
            startPt = defaults.opts.startPt,
            endPt = defaults.opts.endPt,
            dowelRadius = defaults.opts.dowelRadius,
            dowelHolderLength = defaults.opts.dowelHolderLength,
            unitLength = defaults.opts.unitLength,
            endOffset = defaults.opts.endOffset,
            baseLineOffset = defaults.opts.baseLineOffset,
            flip = defaults.opts.flip,
            type = defaults.opts.type,
            scale = defaults.opts.scale,
            interfaceThickness = defaults.opts.interfaceThickness,
            fitGap = defaults.opts.fitGap,
        } = opts

        const stdOpts = {
            type,
            scale,
            interfaceThickness,
            fitGap,
        }

        const initOpts = {
            startPt,
            endPt,
            dowelRadius,
            dowelHolderLength,
            unitLength,
            endOffset,
            baseLineOffset,
            flip,
            ...stdOpts,
        }

        console.log('dowelHolderLineOpts() -- initOpts', initOpts)

        return initOpts
    }


    const dowelHolderLineProps = (opts) => {
        const defaults = dowelHolderLineDefaults()

        const {
            startPt,
            endPt,
            dowelRadius,
            dowelHolderLength,
            unitLength,
            endOffset,
            baseLineOffset,
            flip,
            type,
            scale,
            interfaceThickness,
            fitGap,
        } = opts


        /* ----------------------------------------
         * Prop calculations
         * ------------------------------------- */

        const types = ['default', 'alt']

        const lineWidth = standards.MD_PROFILE_BEAD_WIDTH
        const lineLength = distBetweenPoints(startPt, endPt)
        const compLineAngle = geometry.angleOfTwoPtLine(startPt, endPt)
        const midPt = midPtBetweenPoints(startPt, endPt)

        const holderBottomGrooveWidth = dowelRadius * 2
        const totalWidth = lineWidth * 2 + holderBottomGrooveWidth

        let lineOffset = lineWidth / 2 + baseLineOffset
        if (flip) {
            lineOffset = -lineOffset
        }


        /* ----------------------------------------
        * Preparing Model Properties, Dimensions
        * ------------------------------------- */

        /** Derived user options for the model */
        const modelOpts = {
            type,
            scale,
            types,
            flip,
        }
        /** Various dimensions for model */
        const modelDims = {
            dowelRadius,
            dowelHolderLength,
            unitLength,
            endOffset,
            baseLineOffset,
            lineWidth,
            lineLength,
            compLineAngle,
            holderBottomGrooveWidth,
            totalWidth,
            lineOffset,
            interfaceThickness,
            fitGap,
        }

        /** Various key points for model */
        const modelPoints = {
            centre: defaults.vals.points.centre,
            startPt,
            midPt,
            endPt,
        }


        /* ---------------------------------------------
        *  Model Properties
        * ----------------------------------------------
        * Properties accessible to all model functions.
        * --------------------------------------------- */

        const modelProperties = {
            metadata: {
                id: '9999',
                name: 'New Model',
                project: 'New Project',
                author: 'Somebody Somewhere',
                organization: 'Salvador Workshop',
                client: null,
            },
            opts: modelOpts,
            dims: modelDims,
            points: modelPoints,
        }

        console.log('dowel-holder-line -- modelProperties', modelProperties)

        return modelProperties
    }


    /**
     * Dowel Holder Line
     * @param {*} opts 
     * @returns `geom3` or `geom3[]`
     * @author R. J. Salvador
     * @version 1.1.1
     */
    const dowelHolderLine = (opts) => {
        const defaults = dowelHolderLineDefaults()



        // User options
        const {
            size = defaults.opts.size,
            interfaceThickness = defaults.opts.interfaceThickness,
            fitGap = defaults.opts.fitGap,
            type = defaults.opts.type,
            flip = defaults.opts.flip,
            scale = defaults.opts.scale,
            dowelRadius = defaults.opts.dowelRadius,
            dowelHolderLength = defaults.opts.dowelHolderLength,
            unitLength = defaults.opts.unitLength,
            startPt = defaults.opts.startPt,
            endPt = defaults.opts.endPt,
            endOffset = defaults.opts.endOffset,
            baseLineOffset = defaults.opts.baseLineOffset,
        } = opts

        const inOpts = {
            size,
            interfaceThickness,
            fitGap,
            type,
            flip,
            scale,
            dowelRadius,
            dowelHolderLength,
            unitLength,
            startPt,
            endPt,
            endOffset,
            baseLineOffset,
        }

        const modelProperties = dowelHolderLineProps(inOpts)


        /* ----------------------------------------
         * Modelling, Component/Assembly Modules
         * ------------------------------------- */

        /** Sub-component 01 */
        const dowelComponent = (modelProps) => {
            const dHolderOpts = {
                dowelRadius: modelProps.dims.dowelRadius,
                length: modelProps.dims.dowelHolderLength
            }

            let dHolder = fittings.roundFitting(dHolderOpts)[0]
            dHolder = rotate([0, 0, TAU / 4], dHolder)

            return dHolder
        }

        const lineEnds = (modelProps) => {
            const {
                interfaceThickness,
                totalWidth,
                lineLength,
                compLineAngle,
            } = modelProps.dims

            const {
                midPt,
            } = modelProps.points

            const lineEnd = cuboid({
                size: [
                    interfaceThickness,
                    totalWidth,
                    interfaceThickness,
                ]
            })

            const modeStart = ['min', 'center', 'min']
            const modeEnd = ['max', 'center', 'min']

            const ptStart = [lineLength / -2, 0, 0]
            const ptEnd = [lineLength / 2, 0, 0]

            let ends = union(
                align({ modes: modeStart, relativeTo: ptStart }, lineEnd),
                align({ modes: modeEnd, relativeTo: ptEnd }, lineEnd),
            )

            ends = rotate(
                [0, 0, compLineAngle],
                ends
            )

            ends = translate([midPt[0], midPt[1], 0], ends)

            return ends
        }

        /** Sub-component 02 */
        const lineComponent = (modelProps) => {
            const {
                baseLineOffset,
                fitGap,
                endOffset,
                lineWidth,
                lineOffset,
                unitLength,
            } = modelProps.dims

            const {
                startPt,
                endPt,
            } = modelProps.points

            const dComponent = dowelComponent(modelProps)

            const cLineOpts = {
                endOffset: endOffset,
                baseLineOffset: lineOffset,
                component: dComponent,
                startPt,
                endPt,
                unitLength,
            }

            return componentLine(cLineOpts)[0]
        }

        /* ----------------------------------------
         * Complete Assembly
         * ------------------------------------- */

        /** Final Assembly */
        const finalAssembly = (modelProps) => {
            const lComponent = lineComponent(modelProps)
            const lEnds = lineEnds(modelProps)

            const fAssembly = union(
                lComponent,
                lEnds,
            )

            return fAssembly
        }

        /* ----------------------------------------
         * Outputs
         * ------------------------------------- */


        let dComponent = dowelComponent(modelProperties)
        let lComponent = lineComponent(modelProperties)
        let lEnds = lineEnds(modelProperties)

        let mainPart = finalAssembly(modelProperties)

        let auxParts = {
            dowelComponent: dComponent,
            lineComponent: lComponent,
            lineEnds: lEnds,
        }

        return [mainPart, auxParts, modelProperties]
    }

    return dowelHolderLine
}

module.exports = {
    init: dowelHolderLineInit,
}
