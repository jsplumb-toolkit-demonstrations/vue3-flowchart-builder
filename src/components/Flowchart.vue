<template>
    <div style="width: 100%;height: 100%;position: relative;">
        <jsplumb-toolkit ref="toolkitComponent"
                         url="data/copyright.json"
                         id="toolkit"
                         surface-id="surface"
                         v-bind:render-params="this.renderParams()"
                         v-bind:view="this.viewParams()"
                         v-bind:toolkit-params="this.toolkitParams()">
        </jsplumb-toolkit>
        <jsplumb-miniview surface-id="surface"></jsplumb-miniview>
    </div>
</template>

<script>

    import { loadSurface  } from '@jsplumbtoolkit/browser-ui-vue3';
    import {
        ForceDirectedLayout,
        LassoPlugin,
        DrawingToolsPlugin,
        EdgePathEditor,
        OrthogonalConnector,
        ArrowOverlay, BlankEndpoint,
        LabelOverlay, AnchorLocations, EVENT_CLICK, EVENT_TAP
    } from "@jsplumbtoolkit/browser-ui";

    import StartNode from './StartNode.vue'
    import ActionNode from './ActionNode.vue'
    import QuestionNode from './QuestionNode.vue'
    import OutputNode from './OutputNode.vue'

    import { defineComponent } from "vue";

    const TARGET = 'target';
    const SOURCE = 'source';
    const START = 'start';
    const SELECTABLE = 'selectable';
    const RESPONSE = 'response';
    const OUTPUT = 'output';
    const QUESTION = 'question';
    const ACTION = 'action';
    const DEFAULT = "default";

    let toolkitComponent;
    let toolkit;
    let surface;
    let edgeEditor;

    export default defineComponent({

        name: 'jsp-toolkit',
        props:["surfaceId"],
        inject:['service'],
        methods:{
            viewParams:function() {
                return {
                    nodes: {
                        [START]: {
                            component:StartNode
                        },
                        [SELECTABLE]: {
                            events: {
                                [EVENT_TAP]: (params) => {
                                    toolkit.toggleSelection(params.obj);
                                }
                            }
                        },
                        [QUESTION]: {
                            parent: SELECTABLE,
                            component:QuestionNode
                        },
                        [ACTION]: {
                            parent: SELECTABLE,
                            component:ActionNode
                        },
                        [OUTPUT]:{
                            parent:SELECTABLE,
                            component:OutputNode
                        }
                    },
                    edges: {
                        [DEFAULT]: {
                            anchor:AnchorLocations.AutoDefault,
                            endpoint:BlankEndpoint.type,
                            connector: {type:OrthogonalConnector.type, options:{ cornerRadius: 5 } },
                            paintStyle: { strokeWidth: 2, stroke: "rgb(132, 172, 179)", outlineWidth: 3, outlineStroke: "transparent" },	//	paint style for this edge type.
                            hoverPaintStyle: { strokeWidth: 2, stroke: "rgb(67,67,67)" }, // hover paint style for this edge type.
                            events: {
                                [EVENT_CLICK]:(p) => {
                                    edgeEditor.startEditing(p.edge, {
                                        deleteButton:true,
                                        onMaybeDelete:(edge, connection, doDelete) => {
                                            this.service.confirmDeleteEdge(edge, doDelete);
                                        }
                                    });
                                }
                            },
                            overlays: [
                                { type:ArrowOverlay.type, options:{ location: 1, width: 10, length: 10 } }
                            ]
                        },
                        [RESPONSE]:{
                            parent:DEFAULT,
                                overlays:[
                                {
                                    type: LabelOverlay.type,
                                    options: {
                                        label: "${label}",
                                        events: {
                                            [EVENT_CLICK]: (p) => {
                                                this.service.editEdge(p.edge.data, (data) => {
                                                    toolkit.updateEdge(p.edge, data);
                                                }, () => null)
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    },

                    ports: {
                        [START]: {
                            edgeType: DEFAULT
                        },
                        [SOURCE]: {
                            maxConnections: -1,
                            edgeType: RESPONSE
                        },
                        [TARGET]: {
                            maxConnections: -1,
                            isTarget: true
                        }
                    }
                }
            },
            toolkitParams:function() {
                return {
                    nodeFactory: this.service.nodeFactory,
                    beforeStartConnect: (node) => {
                        // limit edges from start node to 1. if any other type of node, return
                        return (node.data.type === START && node.getEdges().length > 0) ? false : {label: "..."};
                    },
                    edgeFactory: (type, data, continueCallback, abortCallback) => this.service.editEdge(data, continueCallback, abortCallback)
                }
            },
            renderParams:function() {
                return {
                    layout:{
                        type:ForceDirectedLayout.type
                    },
                    plugins: [
                        DrawingToolsPlugin.type,
                        {
                            type:LassoPlugin.type,
                            options:{
                                invert:true
                            }
                        }
                    ],
                    events:{
                        canvasClick:() => {
                            toolkit.clearSelection();
                            edgeEditor.stopEditing();
                        }
                    },
                    consumeRightClick: false,  // this is a dev setting - it just allows you to right-click and inspect. In production you might want to take this out (the default value is `true`)
                    dragOptions: {
                        filter: ".jtk-draw-handle, .node-action, .node-action i"
                    },
                    zoomToFit:true,
                    grid:{
                        size:{
                            w:20,
                            h:20
                        }
                    },
                    magnetize:{
                        afterDrag:true
                    }
                }
            }
        },
        mounted() {

            toolkitComponent = this.$refs.toolkitComponent;
            toolkit = toolkitComponent.toolkit;

            loadSurface(this.surfaceId, (s) => {
                surface = s;
                edgeEditor = new EdgePathEditor(s);
            })
        }
    })

</script>
