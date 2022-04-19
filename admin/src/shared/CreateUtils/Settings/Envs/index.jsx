import { useMutation } from '@apollo/react-hooks'
import { Flex, Form, Spacer, Text, TextButton, TunnelHeader } from '@dailykit/ui'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { ENVS } from '../../../../apps/settings/graphql'
import { logger } from '../../../utils'
import { RadioButton, RadioGroupOption, TunnelBody } from '../../styled'
import validatorFunc from '../../validator'

const CreateEnvTunnel = ({ closeTunnel }) => {
    const envInstance = {
        envTitle: {
            value: '',
            meta: {
                isTouched: false,
                isValid: false,
                errors: [],
            },
        },
        envValue: {
            value: '',
            meta: {
                isTouched: false,
                isValid: false,
                errors: [],
            },
        },
        belongsTo: {
            value: null,
        }
    }
    const EnvInstances = [envInstance]
    const [envs, setEnvs] = useState(EnvInstances)
    const options = [
        { id: 1, payload: 'admin', title: 'Admin' },
        { id: 2, payload: 'server', title: 'server' },
        { id: 3, payload: 'store', title: 'Store' },
    ]
    const [createEnvs, { loading: inFlight }] = useMutation(
        ENVS.CREATE,
        {
            onCompleted: () => {
                toast.success('Mile range added!')
                closeTunnel(3)
            },
            onError: error => {
                toast.error('Something went wrong!')
                logger(error)
            },
        }
    )
    const handleGeoBoundaryChange = (field, value, index) => {
        const newEnvs = [...envs]
        newEnvs[index] = {
            ...newEnvs[index],
            [field]: {
                ...newEnvs[index][field],
                value,
            },
        }
        setEnvs([...newEnvs])
    }
    const handleGeoBoundaryFocus = (field, index) => {
        const newEnvs = [...envs]
        newEnvs[index] = {
            ...newEnvs[index],
            [field]: {
                ...newEnvs[index][field],
                meta: {
                    isTouched: true,
                    isValid: true,
                    errors: [],
                },
            },
        }
        setEnvs([...newEnvs])
    }
    const validate = (field, index) => {
        const { isValid, errors } = validatorFunc['text'](envs[index][field].value)
        const newEnvs = envs
        newEnvs[index] = {
            ...envs[index],
            [field]: {
                ...envs[index][field],
                meta: {
                    isTouched: false,
                    isValid,
                    errors,
                },
            },
        }
        setEnvs([...newEnvs])
    }
    const createEnvsHandler = () => {
        try {
            const objects = envs.filter(Boolean).map(eachEnv => ({
                title: eachEnv.envTitle.value,
                value: eachEnv.envValue.value,
                belongsTo: eachEnv.belongsTo.value
            }))
            if (!objects.length) {
                throw Error('Nothing to add!')
            }
            createEnvs({
                variables: {
                    objects,
                },
            })
        } catch (error) {
            toast.error(error.message)
        }
    }
    const save = () => {
        if (inFlight) return
        const envsValidation = envs.every(object =>
            object.envTitle.meta.isValid && object.envValue.meta.isValid && object.belongsTo.value)
        if (envsValidation === true) {
            return createEnvsHandler()
        }
        return toast.error('All Fields Are required!')

    }
    console.log(envs);
    return (
        <>
            <TunnelHeader
                title="Create new Envs"
                right={{
                    action: save,
                    title: "Save"
                }}
                close={() => closeTunnel(1)}
            />
            <TunnelBody>
                {envs.map((eachEnvs, index) => (
                    <Flex key={index}>
                        <Form.Group>
                            <Form.Label htmlFor={`envTitle-${index}`} title={`envTitle ${index + 1}`}>
                                Env Title
                            </Form.Label>
                            <Form.Text
                                id={`envTitle-${index}`}
                                name={`envTitle-${index}`}
                                value={eachEnvs.envTitle.value}
                                onChange={e => handleGeoBoundaryChange(
                                    "envTitle",
                                    e.target.value,
                                    index
                                )}
                                onFocus={() => {
                                    handleGeoBoundaryFocus('envTitle', index)
                                }}
                                onBlur={() => validate('envTitle', index)}
                                placeholder="Enter Env Title"
                                hasError={
                                    eachEnvs.envTitle.meta.isTouched &&
                                    !eachEnvs.envTitle.meta.isValid
                                }
                            />
                            {!eachEnvs.envTitle.meta.isTouched &&
                                !eachEnvs.envTitle.meta.isValid &&
                                eachEnvs.envTitle.meta.errors.map(
                                    (error, index) => (
                                        <Form.Error key={index}>
                                            {error}
                                        </Form.Error>
                                    )
                                )}
                        </Form.Group>
                        <Spacer size="16px" yAxis />
                        <Form.Group>
                            <Form.Label htmlFor={`envValue-${index}`} title={`Env Value ${index + 1}`}>
                                Env Value
                            </Form.Label>
                            <Form.Text
                                id={`envValue-${index}`}
                                name={`envValue-${index}`}
                                value={eachEnvs.envValue.value}
                                onChange={e => handleGeoBoundaryChange(
                                    "envValue",
                                    e.target.value,
                                    index
                                )}
                                onFocus={() => {
                                    handleGeoBoundaryFocus('envValue', index)
                                }}
                                onBlur={() => validate('envValue', index)}
                                placeholder="Enter Env Value"
                                hasError={
                                    eachEnvs.envValue.meta.isTouched &&
                                    !eachEnvs.envValue.meta.isValid
                                }
                            />
                            {!eachEnvs.envValue.meta.isTouched &&
                                !eachEnvs.envValue.meta.isValid &&
                                eachEnvs.envValue.meta.errors.map(
                                    (error, index) => (
                                        <Form.Error key={index}>
                                            {error}
                                        </Form.Error>
                                    )
                                )}
                        </Form.Group>
                        <Spacer size="16px" yAxis />
                        <Text
                            as='subtitle'
                            style={{ color: '#57567a', marginBottom: '4px' }}
                        >
                            Belongs To
                        </Text>
                        <RadioGroupOption>
                            {options.map(option => (
                                <RadioButton
                                    key={option.id}
                                    onClick={() => {
                                        option.payload === eachEnvs.belongsTo.value ? handleGeoBoundaryChange(
                                            "belongsTo",
                                            null,
                                            index
                                        ) : handleGeoBoundaryChange(
                                            "belongsTo",
                                            option.payload,
                                            index
                                        )
                                    }}
                                    active={eachEnvs.belongsTo.value === option.payload}
                                >
                                    <span>{option.title}</span>
                                </RadioButton>
                            ))}
                        </RadioGroupOption>
                    </Flex>
                ))
                }
            </TunnelBody>
        </>
    )
}

export default CreateEnvTunnel