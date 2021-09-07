import React , {useEffect,useState} from 'react';
import {AVAILABLE_EVENTS, INSERT_WEBHOOK_EVENTS } from '../graphql';
import { Loader } from '@dailykit/ui'
import { useQuery, useMutation } from '@apollo/react-hooks'
import {logger}  from '../../../../shared/utils'
import {TextButton , Form, Spacer, Text, ButtonGroup, Select, Tunnel, useTunnel, TunnelHeader, Tunnels } from '@dailykit/ui'
import { toast } from 'react-toastify'
import {
    ListHeader,
    ListItem,
    List,
    ListOptions,
    ListSearch,
    TagGroup,
    Tag
 } from '@dailykit/ui'
 import { useSingleList, useMultiList } from '@dailykit/ui'
// import addWebhookTunnels from '../tunnels/addWebhookTunnel'

function AddWebHook(props){

    // react states for reference to values of selected event and input url Endpoint
    const [selectedEvent , updateSelectedEvent] = useState(null)
    const [inputWebhookUrl , updatedInputWebhookUrl] = useState(null)
    const [addOptionState , setAddOptionState] = useState(false)
    const [inputAdvanceConfigs, updatedInputAdvanceCofigs] = useState({"timeOut": 60, "retryInterval": 10, "numberOfRetries": 0 })

    const [tunnels, openTunnel, closeTunnel] = useTunnel(2)

    const [search, setSearch] = React.useState('')

    
    
    
   

    // mutation for creating new webhook 
    const [insertWebhookEventUrl, {loading : webhookLoading}] = useMutation(INSERT_WEBHOOK_EVENTS ,{
        onComplete : (data) => {
            toast.success('webhook successfully created')
        },
        onError : (error) =>{
            toast.error('Something went wrong (Ex. current webhook already exist)')
            logger(error)
        },
        
    })

    // on submitting form (or clicking create event button )
    const submitForm = () => {

        // add validation for checking if the values are not empty [~ pending ]
        if(selectedEvent === '' || selectedEvent == null ){
            toast.error('Please select an event')
            return 
        }
        else if(inputWebhookUrl === '' || inputWebhookUrl === null) {
            toast.error('URL end point must not be empty')
            return 
        }else if(inputWebhookUrl !== null){
            // adding regex to handle valid url value 
            var expression = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
            var regex = new RegExp(expression);
            if (!inputWebhookUrl.match(regex)) {
                toast.error("invalid url value");
                return
              } 
            else{     
                // call mutation 
                insertWebhookEventUrl({
                    variables:{
                        "urlEndpoint": inputWebhookUrl,
                        "availableWebhookEventId": selectedEvent,
                        "advanceConfig": inputAdvanceConfigs
                    }
                })
    
                // to check if the mutation result is still loading 
                if(webhookLoading){
                    return <Loader/>
                }else{
                    // closing tunnel
                    closeTunnel(2)
                    closeTunnel(1)
                    setAddOptionState(false)
                }
            }

        }
        
        
    }
    
    
    // query to fetch the available events to show in the form 
    const {loading:eventsLoading, error:eventsError, data:eventsData} = useQuery(AVAILABLE_EVENTS);
    if (eventsLoading) return <Loader />;

    if (eventsError) {
        logger(eventsError)
        return null
    }


    
    const availableEvents = eventsData.developer_availableWebhookEvent.map(event =>
        ({id:event.id , description : event.description , title : event.label }))
    var options = [...availableEvents]
    
    const [list, current, selectOption] = useSingleList([])
    
    
        return (
            <>
            
                {/* <addWebhookTunnels tunnels={tunnels} openTunnel={openTunnel} closeTunnel={closeTunnel} setAddOptionState={setAddOptionState} submitForm={submitForm} updatedInputAdvanceCofigs={updatedInputAdvanceCofigs} inputAdvanceConfigs={inputAdvanceConfigs} options={options} updateSelectedEvent={updateSelectedEvent} addOptionState={addOptionState} >
                </addWebhookTunnels> */}
                {!addOptionState &&
                <TextButton type="solid" align="right" onClick={() => {setAddOptionState(true);openTunnel(1)}}>Add WebHook</TextButton>
                }
                <Tunnels tunnels={tunnels}>
                    <Tunnel style={{padding:10}} layer={1}>

                        <TunnelHeader
                        title="Select Event Webhook"
                        close={() => {closeTunnel(1);setAddOptionState(false)}}
                        description='This is for selecting event'
                        
                        right={
                            {
                                title: 'Next',
                                action: () => openTunnel(2)
                            }
                        }
                    />
                        
                        <Spacer size='16px' />
                        <Form.Group>
                            <Form.Label htmlFor='webhookEvent' title='webhookEvent'>
                        Select Event
                            </Form.Label>
                            {/* <Form.Select id='webhookEvent' name='webhookEvent' options={options} onChange={(e) => {updateSelectedEvent(e.target.value)}} placeholder='Select an Event' /> */}
                            <List>
                                {Object.keys(current).length > 0 ? (
                                <ListItem
                                    type='SSL2'
                                    content={{
                                        title: current.title,
                                        description: current.description
                                    }}
                                />
                                ) : (
                                <ListSearch
                                    onChange={value => setSearch(value)}
                                    placeholder='type what you’re looking for...'
                                />
                                )}
                                <ListHeader type='SSL2' label='Events' />
                                <ListOptions>
                                {list
                                    .filter(option => option.title.toLowerCase().includes(search))
                                    .map(option => (
                                        <ListItem
                                            type='SSL2'
                                            key={option.id}
                                            isActive={option.id === current.id}
                                            onClick={() => selectOption('id', option.id)}
                                            content={{
                                            title: option.title,
                                            description: option.description
                                            }}
                                        />
                                    ))}
                                </ListOptions>
                            </List>
                        </Form.Group>
                        <Spacer size='16px' />
                        
                        
                    </Tunnel>
                    <Tunnel style={{padding:10}} layer={2}>
                        <TunnelHeader
                            title="Enter Webhook URL"
                            close={() => closeTunnel(2)}
                            description='This is for entering webhook url'
                            
                            right={
                                {
                                    title: 'Create',
                                    action: () => {submitForm();setAddOptionState(false)}
                                }
                            }
                        />
                        <Spacer size='16px' />
                        <Form.Group>
                        <Form.Label htmlFor='webhookUrl' title='webhookUrl'>
                        Add Webhook URL
                        </Form.Label>
                        <Form.Text
                        id='webhookUrl'
                        name='webhookUrl'
                        onChange={(e) => {updatedInputWebhookUrl(e.target.value)}}
                        placeholder='Enter the webhook URL..'
                        />
                        <Spacer size='24px' />
                        <Text as='h3'>Advance Configs</Text>
                        <Spacer size='16px' />
                        <Form.Label htmlFor='numberOfRetries' title='numberOfRetries'>
                            Number of Retries
                        </Form.Label>
                        <Form.Number
                            id='numberOfRetries'
                            name='numberOfRetries'
                            onChange={(e) => {updatedInputAdvanceCofigs({"timeOut":inputAdvanceConfigs.timeOut, "retryInterval":inputAdvanceConfigs.retryInterval, "numberOfRetries":parseInt(e.target.value)})}}
                            placeholder='Enter number of retries'
                        />
                        <Spacer size='16px' />
                        <Form.Label htmlFor='retryInterval' title='retryInterval'>
                            Retry Interval (sec)
                        </Form.Label>
                        <Form.Number
                            id='retryInterval'
                            name='retryInterval'
                            onChange={(e) => {updatedInputAdvanceCofigs({"timeOut":inputAdvanceConfigs.timeOut, "retryInterval":parseInt(e.target.value), "numberOfRetries":inputAdvanceConfigs.numberOfRetries})}}
                            placeholder='Enter retry interval'
                        />
                        <Spacer size='16px' />
                        <Form.Label htmlFor='timeOut' title='timeOut'>
                            Timeout (sec)
                        </Form.Label>
                        <Form.Number
                            id='timeOut'
                            name='timeOut'
                            onChange={(e) => {updatedInputAdvanceCofigs({"timeOut":parseInt(e.target.value), "retryInterval":inputAdvanceConfigs.retryInterval, "numberOfRetries":inputAdvanceConfigs.numberOfRetries})}}
                            placeholder='Enter timeout'
                        />
                        </Form.Group>
                        <Spacer size='25px' />
                    </Tunnel>
                </Tunnels>
            
            </>
        )
    }

    


export default AddWebHook;