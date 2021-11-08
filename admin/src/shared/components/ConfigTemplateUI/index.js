import React from 'react'
import _ from 'lodash'
import { getFieldUI } from './getFieldUI'
import { TextButton } from '@dailykit/ui'
import styled from 'styled-components'

const ConfigTemplateUI = ({ config, setConfig, configSaveHandler }) => {
   const [configJSON, setConfigJSON] = React.useState({})
   const [fields, setFields] = React.useState([])
   const [isValid, setIsValid] = React.useState(true)

   const elements = []
   const onConfigChange = (e, value) => {
      let updatedConfig
      const type = _.get(configJSON, `${e.target.name}.dataType`)
      if (type === 'boolean' || type === 'html' || type === 'select') {
         updatedConfig = _.set(configJSON, `${e.target.name}.value`, value)
      } else {
         updatedConfig = _.set(
            configJSON,
            `${e.target.name}.value`,
            e.target.value
         )
      }
      setConfigJSON(prev => ({
         ...prev,
         ...updatedConfig,
      }))
   }
   const getHeaderUI = ({ title, fieldData, key }) => {
      const indentation = `${key.split('.').length * 8}px`
      return (
         <div
            id={key}
            style={{
               marginLeft: indentation,
            }}
         >
            <h1>{title.toUpperCase()}</h1>
            {fieldData.description && <p>{fieldData.description}</p>}
         </div>
      )
   }
   const showConfigUI = (configData, rootKey) => {
      _.forOwn(configData, (value, key) => {
         const isFieldObject = _.has(value, 'value')
         if (isFieldObject) {
            const updatedRootkey = rootKey ? `${rootKey}.${key}` : key
            elements.push(
               getFieldUI({
                  key: updatedRootkey,
                  configJSON,
                  onConfigChange,
                  configSaveHandler,
                  isValid, setIsValid
               })
            )
         } else {
            const updatedRootkey = rootKey ? `${rootKey}.${key}` : key
            if (typeof value === 'object' && value !== null) {
               elements.push(
                  getHeaderUI({
                     title: key,
                     fieldData: value,
                     key: updatedRootkey,
                  })
               )
               showConfigUI(value, updatedRootkey)
            }
         }
      })
   }
   const renderAllFields = (data, rootKey) => {
      showConfigUI(data, rootKey)
      setFields([...elements])
   }

   React.useEffect(() => {
      if (Object.keys(configJSON).length) {
         renderAllFields(configJSON, '')
      }
   }, [configJSON])

   React.useEffect(() => {
      const updatedConfigData = _.defaultsDeep(config, configJSON)
      setConfigJSON(updatedConfigData)
      setConfig(updatedConfigData)
      setFields([])
   }, [config])

   return (
      <>
         <div>
            {fields.length > 0 ? (
               <div>
                  {fields.map((field, index) => (
                     <div key={index}>{field}</div>
                  ))}
                  {!(fields[0]?.props?.fieldDetail?.showModal) && <TextButton size="sm" type="outline" disabled={!isValid} onClick={() => configSaveHandler(configJSON)}>Save</TextButton>}
               </div>
            ) : (
               <p style={{ textAlign: "center", fontSize: "2rem" }}>
                  There are no config related to this Module
               </p>
            )}
         </div>
      </>
   )
}
export default ConfigTemplateUI


const StyledConfig = styled.div`
  border: 1px solid rgb(196, 196, 196);
  height: 100%;
  box-sizing: border-box;
  border-radius: 4px;
  padding: 8px 8px 0px;
  margin-top: 24px;
  margin-bottom: 8px;
  position: relative;
`
