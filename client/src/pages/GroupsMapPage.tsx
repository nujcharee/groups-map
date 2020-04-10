import { Form, Button, Col, Container } from 'react-bootstrap'
import React, { useState, useEffect } from 'react'
import haversine from 'haversine-distance'
import { Link, useLocation } from 'react-router-dom'

import { useRequest } from '../contexts/RequestProvider'
import GroupsTable from '../components/GroupsTable'
import GroupMap from '../components/GroupMap'

import { useMapState } from '../contexts/MapProvider'
import useLocationSearch from '../utils/useLocationSearch'
import { Group } from '../utils/types'
import { gtag } from '../utils/gtag'
import { useData } from '../contexts/DataProvider'
import GroupsList from '../components/GroupsList'

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

function GroupsMapPage() {
  const query = useQuery()
  const { groups } = useData()
  const [place, setPlace] = useState('')
  const [placeOverlay, setPlaceOverlay] = useState(false)
  const { locate, error, name } = useLocationSearch()
  const [{ center, group }] = useMapState()

  const sortedByDistance = groups
    .map((g) => ({
      ...g,
      distance: haversine(center, g.location_coord),
    }))
    .sort((a, b) => (a.distance > b.distance ? 1 : -1))

  const request = useRequest()
  const searchTerm = query.get('place')

  useEffect(() => {
    if (searchTerm && searchTerm.length > 0) locate(searchTerm)
    // request('/group/get').then(setGroups).catch(console.log)
  }, [request])

  return (
    <>
      <div className="place-form">
        {!placeOverlay ? (
          <Form
            onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault()
              gtag('event', 'Searched for a location', {
                event_category: 'Map',
                event_label: 'Clicked search button',
              })
              locate(place)
            }}
          >
            <Form.Row>
              <Col>
                <Form.Text className="text-muted">{error}</Form.Text>
              </Col>
            </Form.Row>
            <Form.Row className="cvd-search-row">
              <Col xs={9} md={10} className="input-height cvd_search_input">
                <Form.Group className="place-input">
                  <Form.Control
                    value={place}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlace(e.target.value)}
                    type="text"
                    placeholder="Find my local group"
                  />
                </Form.Group>
              </Col>
              <Col xs={3} md={2} className="input-height cvd_search_button">
                <Button
                  style={{ backgroundColor: 'rgb(0, 79, 202)' }}
                  className="full-width search-button-blue"
                  onClick={() => locate(place)}
                  variant="primary"
                  // size="sm"
                >
                  Search
                </Button>
              </Col>
              <Col xs={12} md={12} className="input-height thrv_text_element cvd_add_group_button">
                Or you can register your mutual aid group{' '}
                <Link className="thrive-a" to="/create-group">
                  here
                </Link>
              </Col>
            </Form.Row>
          </Form>
        ) : (
          <div>
            <h4>Showing groups nearest to {place}</h4>
            <button type="button" className="blue" onClick={() => setPlaceOverlay(false)}>
              Use a different place
            </button>
          </div>
        )}
      </div>

      <div className="table-wrapper">
        <GroupsTable groups={sortedByDistance} shouldDisplayDistance={!!(group || name)} />
        {/* <GroupsList /> */}
      </div>
      <GroupMap groups={groups} />
    </>
  )
}

export default GroupsMapPage
