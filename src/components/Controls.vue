<template>
    <div class="controls" ref="container">
        <i class="fa fa-arrows selected-mode" mode="pan" title="Pan Mode" v-on:click="panMode()"></i>
        <i class="fa fa-pencil" mode="select" title="Select Mode" v-on:click="selectMode()"></i>
        <i class="fa fa-home" reset title="Zoom To Fit" v-on:click="zoomToFit()"></i>
        <i class="fa fa-undo" undo title="Undo last action" v-on:click="undo()"></i>
        <i class="fa fa-repeat" redo title="Redo last action" v-on:click="redo()"></i>
        <i class="fa fa-times" title="Clear" v-on:click="clear()"></i>
    </div>
</template>

<script>

    import { loadSurface } from "@jsplumbtoolkit/browser-ui-vue3";
    import {
        EVENT_UNDOREDO_UPDATE,
        EVENT_CANVAS_CLICK
    } from "@jsplumbtoolkit/browser-ui"

    import { defineComponent } from "vue"

    let container;
    let surfaceId;

    // a wrapper around getSurface, which expects a callback, as the surface may or may not have been
    // initialised when calls are made to it.
    function _getSurface(cb) {
        loadSurface(surfaceId, cb)
    }

    /**
     Provides the various buttons on the top left of the demo - pan/lasso mode, undo/redo, zoom to fit and clear dataset.
     */
    export default defineComponent({
        props:["surfaceId"],
        methods:{
            panMode:function() {
                _getSurface((s) => s.setMode("pan"))
            },
            selectMode:function() {
                _getSurface((s) => s.setMode("select"))
            },
            zoomToFit:function() {
                _getSurface((s) => s.zoomToFit());
            },
            undo:function() {
                _getSurface((s) => s.toolkitInstance.undo())
            },
            redo:function() {
                _getSurface((s) => s.toolkitInstance.redo())
            },
            clear: function() {
                _getSurface((s) => {
                    const t = s.toolkitInstance;
                    if (t.getNodeCount() === 0 || confirm("Clear canvas?")) {
                        t.clear();
                    }
                });
            }
        },
        mounted() {

            surfaceId = this.surfaceId;
            container = this.$refs.container;
            _getSurface((surface) => {

                //
                // bind to undo/redo events from the toolkit and set an attribute whose value depends on the number
                // of entries in the undo stack. via CSS we style/disable/enable the undo/redo buttons accordingly.
                //
                surface.toolkitInstance.bind(EVENT_UNDOREDO_UPDATE, (state) => {
                    container.setAttribute("can-undo", state.undoCount > 0 ? "true" : "false")
                    container.setAttribute("can-redo", state.redoCount > 0 ? "true" : "false")
                })

                //
                // when the user clicks whitespace, clear the current selection.
                //
                surface.bind(EVENT_CANVAS_CLICK, () => {
                    surface.toolkitInstance.clearSelection()
                });
            });
        }
    })

</script>
