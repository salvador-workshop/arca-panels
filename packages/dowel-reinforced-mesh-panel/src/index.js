"use strict"

const dowelReinforcedMeshPanelInit = ({ jscad, swcadJs }) => {
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
        standards,
    } = swcadJs.data

    const {
        math,
        position,
    } = swcadJs.calcs

    const {
        mesh,
        reinforcements,
    } = swcadJs.components


    //==============================================================================


    /**
     * Builds default values and opts for the model
     * @param {*} opts 
     * @returns default values and opts
     * @memberof dowelReinforcedMeshPanel
     * @access private
     */
    const dowelReinforcedMeshPanelDefaults = () => {
        /** Specific value declarations */
        const defaultValues = {
            constants: {
                reinforcementPatterns: ['x', 'cross', 'diamond', 'full', 'full-double'],
                holePatterns: ['tri', 'square'],
            },
            dims: {
                size: [
                    math.inchesToMm(2),
                    math.inchesToMm(4),
                    math.inchesToMm(1),
                ],
                dowelRadius: 3.5 / 2,
                meshThickness: standards.INTERFACE_THICKNESS,
                meshEdgeMargin: math.inchesToMm(1 / 8),
                meshHoleRadius: math.inchesToMm(1 / 8),
                meshHoleDistance: math.inchesToMm(5 / 16),
            },
            points: {
                centrePt: [0, 0, 0]
            },
            types: {
                default: standards.types.TYPE_DEFAULT,
                alt: standards.types.TYPE_ALT,
            },
        }

        /** Options used by SW models */
        const standardOpts = {
            type: defaultValues.types.default.id,
            scale: 1,
            interfaceThickness: standards.INTERFACE_THICKNESS,
            fitGap: standards.FIT_GAP,
        }

        /** Computed values for option defaults */
        const defaultOpts = {
            ...standardOpts,
            size: defaultValues.dims.size,
            dowelRadius: defaultValues.dims.dowelRadius,
            reinforcementPattern: defaultValues.constants.reinforcementPatterns[0],
            meshThickness: defaultValues.dims.meshThickness,
            meshEdgeMargin: defaultValues.dims.meshEdgeMargin,
            meshHoleRadius: defaultValues.dims.meshHoleRadius,
            meshHoleDistance: defaultValues.dims.meshHoleDistance,
            meshHolePattern: defaultValues.constants.holePatterns[0],
        }

        return {
            opts: defaultOpts,
            vals: defaultValues,
        }
    }


    //------------------------------------------------------------------------------


    /**
     * Initializes options with user input
     * @param {*} opts 
     * @returns model properties
     * @memberof dowelReinforcedMeshPanel
     * @access private
     */
    const dowelReinforcedMeshPanelOpts = (opts) => {
        const defaults = dowelReinforcedMeshPanelDefaults()

        // User options
        const {
            size = defaults.opts.size,
            dowelRadius = defaults.opts.dowelRadius,
            reinforcementPattern = defaults.opts.reinforcementPattern,
            meshThickness = defaults.opts.meshThickness,
            meshEdgeMargin = defaults.opts.meshEdgeMargin,
            meshHoleRadius = defaults.opts.meshHoleRadius,
            meshHoleDistance = defaults.opts.meshHoleDistance,
            meshHolePattern = defaults.opts.meshHolePattern,
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
            size,
            dowelRadius,
            reinforcementPattern,
            meshThickness,
            meshEdgeMargin,
            meshHoleRadius,
            meshHoleDistance,
            meshHolePattern,
            ...stdOpts,
        }


        return initOpts
    }


    //------------------------------------------------------------------------------


    /**
     * Builds model properties from the given opts
     * @param {*} opts 
     * @returns model properties
     * @memberof dowelReinforcedMeshPanel
     * @access private
     */
    const dowelReinforcedMeshPanelProps = (opts) => {
        const defaults = dowelReinforcedMeshPanelDefaults()

        const {
            size,
            dowelRadius,
            reinforcementPattern,
            meshThickness,
            meshEdgeMargin,
            meshHoleRadius,
            meshHoleDistance,
            meshHolePattern,
            type,
            scale,
            interfaceThickness,
            fitGap,
        } = opts

        /* ----------------------------------------
        * Prop calculations
        * ------------------------------------- */

        const width = size[0]
        const depth = size[1]
        const height = size[2]
        const dowelDiam = dowelRadius * 2

        const dowelHolderWidth = dowelDiam + (interfaceThickness * 2)
        const reinforcementThickness = [
            dowelHolderWidth,
            dowelHolderWidth,
            dowelHolderWidth
        ]

        /* ----------------------------------------
        * Preparing Model Properties, Dimensions
        * ------------------------------------- */

        /** Constant values for model */
        const modelConstants = {
            reinforcementPatterns: defaults.vals.constants.reinforcementPatterns,
            holePatterns: defaults.vals.constants.holePatterns,
        }

        /** Derived user options for the model */
        const modelOpts = {
            type,
            reinforcementPattern,
            meshHolePattern,
            scale,
        }

        /** Various dimensions for model */
        const modelDims = {
            size,
            width,
            depth,
            height,
            dowelDiam,
            dowelRadius,
            dowelHolderWidth,
            reinforcementThickness,
            meshThickness,
            meshEdgeMargin,
            meshHoleRadius,
            meshHoleDistance,
            interfaceThickness,
            fitGap,
        }

        /** Various key points for model */
        const modelPoints = {
            centrePt: defaults.vals.points.centrePt,
        }

        /** Components used by model */
        const modelComponents = {
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
            constants: modelConstants,
            opts: modelOpts,
            dims: modelDims,
            points: modelPoints,
            components: modelComponents,
        }


        return modelProperties
    }


    //------------------------------------------------------------------------------

    /* ----------------------------------------
    * MODELLING FUNCTIONS
    * ------------------------------------- */

    /**
     * Base mesh panel
     * @param {*} opts 
     * @returns Array with model, parts, and properties: [`geom3`, `Object.<string, geom3>`, `Object.<string, any>`]
     * @memberof newModelParent
     */
    const baseMeshPanel = (opts) => {
        const defaults = dowelReinforcedMeshPanelDefaults()
        const initOpts = dowelReinforcedMeshPanelOpts(opts)
        const modelProperties = dowelReinforcedMeshPanelProps(initOpts)

        const {
            reinforcementPattern,
            meshHolePattern,
        } = modelProperties.opts

        const {
            size,
            width,
            depth,
            height,
            reinforcementThickness,
            meshThickness,
            meshEdgeMargin,
            meshHoleRadius,
            meshHoleDistance,
        } = modelProperties.dims

        const bMesh = mesh.meshPanel({
            size,
            thickness: meshThickness,
            edgeMargin: meshEdgeMargin,
            holeRadius: meshHoleRadius,
            holeDistance: meshHoleDistance,
        })

        const mainModel = position.ctr(bMesh)
        const modelParts = {
            mainModel,
        }

        return [mainModel, modelParts, modelProperties]
    }

    /**
     * Base panel reinforcement
     * @param {*} opts 
     * @returns Array with model, parts, and properties: [`geom3`, `Object.<string, geom3>`, `Object.<string, any>`]
     * @memberof newModelParent
     */
    const basePanelReinforcement = (opts) => {
        const defaults = dowelReinforcedMeshPanelDefaults()
        const initOpts = dowelReinforcedMeshPanelOpts(opts)
        const modelProperties = dowelReinforcedMeshPanelProps(initOpts)

        const {
            reinforcementPattern,
            meshHolePattern,
        } = modelProperties.opts

        const {
            size,
            width,
            depth,
            height,
            reinforcementThickness,
            meshEdgeMargin,
            meshHoleRadius,
            meshHoleDistance,
        } = modelProperties.dims

        const bReinf = reinforcements.reinforcedRectPanel({
            size,
            reinforcementThickness,
        })[0]

        const mainModel = position.ctr(bReinf)
        const modelParts = {
            mainModel,
        }

        return [mainModel, modelParts, modelProperties]
    }

    /**
     * Reinforced Mesh Panel
     * @param {*} opts 
     * @returns Array with model, parts, and properties: [`geom3`, `Object.<string, geom3>`, `Object.<string, any>`]
     * @memberof newModelParent
     */
    const dowelReinforcedMeshPanel = (opts) => {
        const defaults = dowelReinforcedMeshPanelDefaults()
        const initOpts = dowelReinforcedMeshPanelOpts(opts)
        const modelProperties = dowelReinforcedMeshPanelProps(initOpts)

        const {
            reinforcementPattern,
            meshHolePattern,
        } = modelProperties.opts

        const {
            size,
            width,
            depth,
            height,
            reinforcementThickness,
            meshEdgeMargin,
            meshHoleRadius,
            meshHoleDistance,
        } = modelProperties.dims

        const baseMesh = baseMeshPanel(opts)[0]
        const baseReinforcement = basePanelReinforcement(opts)[0]

        const panelAssembly = union(
            position.ctrMin(baseMesh),
            position.ctrMin(baseReinforcement),
        )

        const mainModel = position.ctr(panelAssembly)
        const modelParts = {
            mainModel,
        }

        return [mainModel, modelParts, modelProperties]
    }

    return {
        defaults: dowelReinforcedMeshPanelDefaults,
        props: dowelReinforcedMeshPanelProps,
        baseMeshPanel,
        basePanelReinforcement,
        dowelReinforcedMeshPanel,
    }
}

module.exports = {
    init: dowelReinforcedMeshPanelInit
}
