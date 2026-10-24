"use strict"

const reinforcedMeshPanelInit = ({ jscad, swcadJs }) => {
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
        reinforcedRectPanel,
    } = swcadJs.components


    //==============================================================================


    /**
     * Builds default values and opts for the model
     * @param {*} opts 
     * @returns default values and opts
     * @memberof reinforcedMeshPanel
     * @access private
     */
    const reinforcedMeshPanelDefaults = () => {
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
                reinforcementThickness: [5, 4, 3],
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
            reinforcementPattern: defaultValues.constants.reinforcementPatterns[0],
            reinforcementThickness: defaultValues.dims.reinforcementThickness,
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
     * @memberof reinforcedMeshPanel
     * @access private
     */
    const reinforcedMeshPanelOpts = (opts) => {
        const defaults = reinforcedMeshPanelDefaults()
        console.log('reinforcedMeshPanelOpts() -- opts', opts)

        // User options
        const {
            size = defaults.opts.size,
            reinforcementPattern = defaults.opts.reinforcementPattern,
            reinforcementThickness = defaults.opts.reinforcementThickness,
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
            reinforcementPattern,
            reinforcementThickness,
            meshThickness,
            meshEdgeMargin,
            meshHoleRadius,
            meshHoleDistance,
            meshHolePattern,
            ...stdOpts,
        }

        console.log('reinforcedMeshPanelOpts() -- initOpts', initOpts)

        return initOpts
    }


    //------------------------------------------------------------------------------


    /**
     * Builds model properties from the given opts
     * @param {*} opts 
     * @returns model properties
     * @memberof reinforcedMeshPanel
     * @access private
     */
    const reinforcedMeshPanelProps = (opts) => {
        const defaults = reinforcedMeshPanelDefaults()
        console.log('reinforcedMeshPanelProps() -- opts', opts)

        const {
            size,
            reinforcementPattern,
            reinforcementThickness,
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

        console.log('reinforcedMeshPanelProps() -- modelProperties', modelProperties)

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
        const defaults = reinforcedMeshPanelDefaults()
        const initOpts = reinforcedMeshPanelOpts(opts)
        const modelProperties = reinforcedMeshPanelProps(initOpts)

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
        const defaults = reinforcedMeshPanelDefaults()
        const initOpts = reinforcedMeshPanelOpts(opts)
        const modelProperties = reinforcedMeshPanelProps(initOpts)

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

        const bReinf = reinforcedRectPanel({
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
    const reinforcedMeshPanel = (opts) => {
        const defaults = reinforcedMeshPanelDefaults()
        const initOpts = reinforcedMeshPanelOpts(opts)
        const modelProperties = reinforcedMeshPanelProps(initOpts)

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

    /**
     * Dowel-Reinforced Mesh Panel
     * @param {*} opts 
     * @returns Array with model, parts, and properties: [`geom3`, `Object.<string, geom3>`, `Object.<string, any>`]
     * @memberof newModelParent
     */
    const dowelReinforcedMeshPanel = (opts) => {
        const defaults = reinforcedMeshPanelDefaults()
        const initOpts = reinforcedMeshPanelOpts(opts)
        const modelProperties = reinforcedMeshPanelProps(initOpts)

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

        const baseMesh = null
        const baseReinforcement = null
        const dowelsCutaway = null

        const mainModel = cuboid()
        const modelParts = {
            mainModel,
        }

        return [mainModel, modelParts, modelProperties]
    }

    return {
        defaults: reinforcedMeshPanelDefaults,
        props: reinforcedMeshPanelProps,
        baseMeshPanel,
        basePanelReinforcement,
        reinforcedMeshPanel,
        dowelReinforcedMeshPanel,
    }
}

module.exports = {
    init: reinforcedMeshPanelInit
}
