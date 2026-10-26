"use strict"

const dowelHolderLineModule = require('./dowel-holder-line.js')

const dowelFramePanelInit = ({ jscad, swcadJs }) => {

    const {
        cylinder,
        cuboid,
    } = jscad.primitives

    const {
        translate,
    } = jscad.transforms

    const {
        intersect,
        union,
    } = jscad.booleans

    const { hull } = jscad.hulls

    const {
        standards,
    } = swcadJs.data

    const {
        math,
        position,
    } = swcadJs.calcs

    const {
        shapes,
    } = swcadJs.profiles

    const {
        beadsBits,
    } = swcadJs.components

    const dowelHolderLine = dowelHolderLineModule.init({ jscad, swcadJs })

    const distBetweenPoints = (startPt, endPt) => {
        const coordDiffs = [
            endPt[0] - startPt[0],
            endPt[1] - startPt[1],
        ]
        const midPt = [
            startPt[0] + (coordDiffs[0] / 2),
            startPt[1] + (coordDiffs[1] / 2),
        ]

        const lineLength = Math.hypot(coordDiffs[0], coordDiffs[1])
        return lineLength
    }

    //==============================================================================


    /**
     * Builds default values and opts for the model
     * @param {*} opts 
     * @returns default values and opts
     * @memberof newModelName
     * @access private
     */
    const dowelFramePanelDefaults = () => {
        /** Specific value declarations */

        const defaultValues = {
            constants: {
            },
            opts: {
                type: standards.types.TYPE_DEFAULT,
                scale: 1,
                reinforcementLevel: 1,
                reinforcementPattern: 'default',
            },
            dims: {
                dowelRadius: 3.25 / 2,
                dowelCtrDistance: [math.inchesToMm(4), math.inchesToMm(8)],
                unitLength: math.inchesToMm(1),
                dowelHolderLength: math.inchesToMm(1 / 4),
                endOffset: math.inchesToMm(7 / 16),
                interfaceThickness: standards.INTERFACE_THICKNESS,
                fitGap: standards.FIT_GAP,
            },
            types: {
                default: standards.types.TYPE_DEFAULT,
                alt: standards.types.TYPE_ALT,
            },
        }

        /** Options used by SW models */
        const standardOpts = {
            type: defaultValues.opts.type,
            scale: defaultValues.opts.scale,
            interfaceThickness: defaultValues.dims.interfaceThickness,
            fitGap: defaultValues.dims.fitGap,
        }

        const defaultOpts = {
            ...standardOpts,
            dowelRadius: defaultValues.dims.dowelRadius,
            dowelCtrDistance: defaultValues.dims.dowelCtrDistance,
            unitLength: defaultValues.dims.unitLength,
            dowelHolderLength: defaultValues.dims.dowelHolderLength,
            reinforcementLevel: defaultValues.opts.reinforcementLevel,
            reinforcementPattern: defaultValues.opts.reinforcementPattern,
            endOffset: defaultValues.dims.endOffset,
        }


        return {
            opts: defaultOpts,
            vals: defaultValues,
        }
    }


    /**
     * Initializes options with user input
     * @param {*} opts 
     * @returns model properties
     * @memberof newModelName
     * @access private
     */
    const dowelFramePanelOpts = (opts) => {
        const defaults = dowelFramePanelDefaults()
        console.log('dowelFramePanelOpts() -- opts', opts)

        // User options
        const {
            dowelRadius = defaults.opts.dowelRadius,
            dowelCtrDistance = defaults.opts.dowelCtrDistance,
            unitLength = defaults.opts.unitLength,
            dowelHolderLength = defaults.opts.dowelHolderLength,
            reinforcementLevel = defaults.opts.reinforcementLevel,
            reinforcementPattern = defaults.opts.reinforcementPattern,
            endOffset = defaults.opts.endOffset,
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
            dowelRadius,
            dowelCtrDistance,
            unitLength,
            dowelHolderLength,
            reinforcementLevel,
            reinforcementPattern,
            endOffset,
            ...stdOpts,
        }

        console.log('dowelFramePanelOpts() -- initOpts', initOpts)

        return initOpts
    }


    /**
     * Builds model properties from the given opts
     * @param {*} opts 
     * @returns model properties
     * @memberof newModelName
     * @access private
     */
    const dowelFramePanelProps = (opts) => {
        const defaults = dowelFramePanelDefaults()
        console.log('dowelFramePanelProps() -- opts', opts)

        const {
            dowelRadius,
            dowelCtrDistance,
            unitLength,
            dowelHolderLength,
            reinforcementLevel,
            reinforcementPattern,
            endOffset,
            type,
            scale,
            interfaceThickness,
            fitGap,
        } = opts

        let dCtrDistance = []
        if (typeof dowelCtrDistance == 'number') {
            dCtrDistance = [
                dowelCtrDistance,
                dowelCtrDistance,
            ]
        } else if (Array.isArray(dowelCtrDistance)) {
            dCtrDistance = [
                dowelCtrDistance[0],
                dowelCtrDistance[1],
            ]
        }

        const dowelDiam = dowelRadius * 2
        const dowelHolderWidth = interfaceThickness * 2 + dowelDiam
        const lineWidth = standards.MD_PROFILE_BEAD_WIDTH
        const holderLineBottomGrooveWidth = dowelRadius * 2
        const holderLineWidth = lineWidth * 2 + holderLineBottomGrooveWidth

        const width = lineWidth * 2 + dCtrDistance[0] + dowelDiam
        const length = lineWidth * 2 + dCtrDistance[1] + dowelDiam
        const lengthUnits = Math.ceil(length / unitLength)
        const cornerPuckRadius = holderLineWidth / 2 + (fitGap * 1.25)

        const centreLineSize = [
            dCtrDistance[0],
            dCtrDistance[1],
        ]
        const reinfRectData = shapes.rectangle.reinforcedRect({
            size: centreLineSize,
            reinforcementPattern,
        })[2]
        console.log('reinfRectData', reinfRectData)

        const panelFramePoints = {
            centre: reinfRectData.points.centre,
            corners: reinfRectData.points.corners,
            midpoints: reinfRectData.points.midpoints,
            lines: [
                ...reinfRectData.points.outline,
                ...reinfRectData.points.braces.diagonal,
            ],
            bracingLines: [
                ...reinfRectData.points.braces.cross,
            ]
        }


        /* ----------------------------------------
         * Base Model Properties, Dimensions
         * ------------------------------------- */

        const modelOpts = {
            type,
            scale,
            reinforcementLevel,
            reinforcementPattern,
        }

        const modelConstants = {
        }

        const modelDims = {
            dowelRadius,
            dowelCtrDistance: dCtrDistance,
            length,
            unitLength,
            dowelHolderLength,
            endOffset,
            width,
            dowelDiam,
            lengthUnits,
            interfaceThickness,
            fitGap,
            dowelHolderWidth,
            lineWidth,
            holderLineWidth,
            cornerPuckRadius,
        }

        const modelPoints = {
            ...panelFramePoints,
        }

        /** Components used by model */
        const modelComponents = {
            interfaceProfileBeads: beadsBits.interface30DegProfileBeads(
                interfaceThickness,
                standards.SM_PROFILE_BEAD_WIDTH,
                standards.MD_PROFILE_BEAD_WIDTH,
                standards.LG_PROFILE_BEAD_WIDTH,
            ),
        }

        const modelProperties = {
            metadata: {
                id: 'P0008',
                name: 'Dowel Joist Panel',
                project: 'SW-2026-Q1',
                author: 'RJ Salvador',
                organization: 'Salvador Workshop',
                client: null,
            },
            opts: modelOpts,
            constants: modelConstants,
            dims: modelDims,
            points: modelPoints,
            components: modelComponents
        }

        console.log('dowelFramePanelProps() -- modelProperties', modelProperties)

        return modelProperties
    }

    /**
     * Dowel Joist Panel
     * @param {*} opts 
     * @returns `geom3` or `geom3[]`
     * @author R. J. Salvador (Salvador Workshop)
     */
    const dowelFramePanel = (opts) => {
        const defaults = dowelFramePanelDefaults()
        const initOpts = dowelFramePanelOpts(opts)
        const modelProperties = dowelFramePanelProps(initOpts)

        /* ----------------------------------------
         * Modelling, Component/Assembly Modules
         * ------------------------------------- */

        const cornerPuck = (modelProps) => {
            const {
                interfaceThickness,
                cornerPuckRadius,
            } = modelProps.dims

            return cylinder({
                radius: cornerPuckRadius,
                height: interfaceThickness,
            })
        }


        const cornerPucks = (modelProps) => {
            const {
                points,
            } = modelProps

            const puckPts = [
                points.centre,
                ...points.corners,
            ]
            const cPucks = puckPts.map(cPt => {
                return translate(
                    [cPt[0], cPt[1], 0],
                    position.ctrMin(cornerPuck(modelProps))
                )
            })

            return union(...cPucks)
        }


        const holderLine = (modelProps, line) => {
            const {
                endOffset,
                unitLength,
                dowelRadius,
                dowelHolderLength,
            } = modelProps.dims
            console.log('holderLine() modelProps, line', modelProps, line)

            const startPt = line[0]
            const endPt = line[1]

            const lineLength = distBetweenPoints(startPt, endPt)
            console.log('holderLine() lineLength', lineLength)

            let uLength = unitLength
            let dHolderLength = dowelHolderLength
            if (lineLength < math.inchesToMm(3)) {
                dHolderLength = math.inchesToMm(3 / 16)
                uLength = math.inchesToMm(8 / 16)
            }

            let eOffset = endOffset
            const isMainLine = startPt[0] == endPt[0]
            if (isMainLine) {
                eOffset = 0
            }

            const hLineProps = {
                startPt,
                endPt,
                dowelRadius,
                dowelHolderLength: dHolderLength,
                unitLength: uLength,
                endOffset: eOffset,
                flip: true,
            }
            console.log('holderLine() hLineProps', hLineProps)
            const hLineOuts = dowelHolderLine(hLineProps)
            return hLineOuts[0]
        }


        const holderLines = (modelProps) => {
            const {
                lines
            } = modelProps.points

            const hLines = lines.map(line => {
                return holderLine(modelProps, line)
            })

            const dpFrameLines = union(...hLines)

            return dpFrameLines
        }


        const bracingCutBox = (modelProps) => {
            const {
                width,
                length,
                holderLineWidth,
                lineWidth,
            } = modelProps.dims


            const braceCutZone = cuboid({
                size: [
                    width - (holderLineWidth * 2) - lineWidth,
                    length - (holderLineWidth * 2) - lineWidth,
                    math.inchesToMm(1),
                ]
            })

            return braceCutZone
        }


        const flatBracing = (modelProps) => {
            const {
                interfaceProfileBeads
            } = modelProps.components

            const {
                bracingLines
            } = modelProps.points

            const beadProfile = interfaceProfileBeads.sm
            const braceCutZone = bracingCutBox(modelProps)

            const bLines = bracingLines.map(line => {
                const bracingLinePts = line.map(linePt => {
                    return translate(
                        [linePt[0], linePt[1], 0],
                        position.ctrMin(beadProfile)
                    )
                })
                return hull(bracingLinePts[0], bracingLinePts[1])
            })

            const braceLines = intersect(
                position.ctrMin(union(...bLines)),
                braceCutZone,
            )

            return braceLines
        }


        /* ----------------------------------------
         * Complete Assembly
         * ------------------------------------- */

        const finalAssembly = (modelProps) => {
            let cPucks = cornerPucks(modelProps)
            let hLines = holderLines(modelProps)
            let fBracing = flatBracing(modelProps)

            const mainAssembly = union(
                cPucks,
                hLines,
            )

            return union(
                position.ctrMin(mainAssembly),
                fBracing,
            )
        }

        /* ----------------------------------------
         * Outputs
         * ------------------------------------- */

        let cornerPuckInst = cornerPuck(modelProperties)
        let cornerPucksInst = cornerPucks(modelProperties)
        let holderLineInst = holderLine(modelProperties, modelProperties.points.lines[0])
        let holderLinesInst = holderLines(modelProperties)

        const mainModel = finalAssembly(modelProperties)

        const modelParts = {
            cornerPuck: cornerPuckInst,
            cornerPucks: cornerPucksInst,
            holderLine: holderLineInst,
            holderLines: holderLinesInst,
        }

        return [mainModel, modelParts, modelProperties]
    }

    return dowelFramePanel
}

module.exports = {
    init: dowelFramePanelInit
}