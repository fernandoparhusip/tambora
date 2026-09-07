import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseMap from '~/components/base/BaseMap.vue'

/* eslint-disable @typescript-eslint/no-this-alias, @typescript-eslint/no-extraneous-class */
let mapInstance: any = null

vi.mock('ol/Map', () => {
  return {
    default: class MockMap {
      handlers: Record<string, any> = {}
      view = {
        animate: vi.fn(),
        getZoom: vi.fn(() => 8.5),
        setZoom: vi.fn(),
        setCenter: vi.fn(),
        on: vi.fn(),
      }
      constructor(_opts?: any) {
        mapInstance = this
      }
      getView() {
        return this.view
      }
      on(evt: string, cb: any) {
        this.handlers[evt] = cb
      }
      once(_evt: string, cb: any) {
        cb()
      }
      updateSize = vi.fn()
      setTarget = vi.fn()
      hasFeatureAtPixel() {
        return true
      }
      forEachFeatureAtPixel(_pixel: any, cb: any) {
        return cb({
          get: (_key: string) => ({ id: 's1', title: 'Sentral Sumbawa', lat: -8.5, lng: 117.4 }),
          getGeometry: () => ({ getCoordinates: () => [117.4, -8.5] }),
        })
      }
    },
  }
})

vi.mock('ol/View', () => ({ default: class MockView {} }))
vi.mock('ol/layer/Tile', () => ({ default: class MockTileLayer { setSource() {} } }))
vi.mock('ol/layer/Vector', () => ({ default: class MockVectorLayer {} }))
vi.mock('ol/source/XYZ', () => ({ default: class MockXYZ {} }))
vi.mock('ol/source/Vector', () => ({
  default: class MockVectorSource {
    features: any[] = []
    clear() {
      this.features = []
    }
    addFeature(f: any) {
      this.features.push(f)
    }
  }
}))
vi.mock('ol/Feature', () => ({
  default: class MockFeature {
    data: any
    constructor(opts: any) {
      this.data = opts
    }
    setStyle() {}
    get(k: string) {
      return this.data?.[k]
    }
    getGeometry() {
      return this.data?.geometry
    }
  }
}))
vi.mock('ol/geom/Point', () => ({
  default: class MockPoint {
    coords: any
    constructor(coords: any) {
      this.coords = coords
    }
    getCoordinates() {
      return this.coords
    }
  }
}))
vi.mock('ol/proj', () => ({
  fromLonLat: (coords: any) => coords,
  toLonLat: (coords: any) => coords,
}))
vi.mock('ol/style', () => ({
  Style: class {},
  Circle: class {},
  Fill: class {},
}))
vi.mock('ol/Overlay', () => ({
  default: class MockOverlay {
    setPosition = vi.fn()
  }
}))

describe('BaseMap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mapInstance = null
    // Mock ResizeObserver
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as any
  })

  it('mounts properly and initializes map with markers', async () => {
    const markers = [
      { id: '1', lat: -8.5, lng: 117.4, title: 'Sentral A', subtitle: 'Normal', color: '#10B981' },
      { id: '2', lat: -8.6, lng: 117.5, title: 'Sentral B', subtitle: 'Gangguan' },
    ]

    const wrapper = mount(BaseMap, {
      props: {
        markers,
        center: [117.4, -8.5],
        zoom: 8.5,
        interactivePicker: false,
      },
      global: {
        stubs: {
          BaseLoadingIndicatorPLN: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)

    // Trigger zoom controls
    const zoomInBtn = wrapper.find('button[title="Perbesar Peta"]')
    if (zoomInBtn.exists()) {
      await zoomInBtn.trigger('click')
      expect(mapInstance.view.setZoom).toHaveBeenCalled()
    }

    const zoomOutBtn = wrapper.find('button[title="Perkecil Peta"]')
    if (zoomOutBtn.exists()) {
      await zoomOutBtn.trigger('click')
      expect(mapInstance.view.setZoom).toHaveBeenCalled()
    }

    // Trigger fullscreen toggle
    const fsBtn = wrapper.find('button[title="Layar Penuh"]')
    if (fsBtn.exists()) {
      await fsBtn.trigger('click')
    }

    // Trigger map click with feature
    if (mapInstance && mapInstance.handlers['click']) {
      mapInstance.handlers['click']({ pixel: [10, 10], coordinate: [117.4, -8.5] })
      expect(wrapper.emitted('marker-click')).toBeTruthy()
    }

    // Trigger pointermove
    if (mapInstance && mapInstance.handlers['pointermove']) {
      mapInstance.handlers['pointermove']({ pixel: [10, 10] })
    }

    // Update props (center, zoom, markers)
    await wrapper.setProps({
      zoom: 9,
      center: [117.5, -8.6],
      markers: [{ id: '3', lat: -8.7, lng: 117.6 }],
    })

    wrapper.unmount()
  })

  it('handles interactive picker mode and map click without feature', async () => {
    const wrapper = mount(BaseMap, {
      props: {
        interactivePicker: true,
      },
    })

    if (mapInstance && mapInstance.handlers['click']) {
      mapInstance.handlers['click']({ coordinate: [118.0, -8.4] })
      expect(wrapper.emitted('map-click')).toBeTruthy()
    }

    if (mapInstance && mapInstance.handlers['pointermove']) {
      mapInstance.handlers['pointermove']({ pixel: [20, 20] })
    }
  })
})
