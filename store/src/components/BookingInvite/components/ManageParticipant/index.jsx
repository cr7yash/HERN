import React, { useEffect, useState } from "react";
import { Flex, IconButton } from "@dailykit/ui";
import { useToasts } from "react-toast-notifications";
import { useMutation, useSubscription } from "@apollo/client";
import { Wrapper } from "./styles";
import ParticipantForm from "../ParticipantForm";
import Modal from "../../../Modal";
import InlineLoader from "../../../InlineLoader";

import useModal from "../../../useModal";
import {
  ChevronRight,
  ChevronDown,
  EditIcon,
  DeleteIcon,
  RsvpIcon,
  NoRsvpIcon,
} from "../../../Icons";
import {
  MANAGE_PARTICIPANTS,
  UPDATE_EXPERIENCE_PARTICIPANTS,
  UPDATE_CART,
  DELETE_CART,
  DELETE_EXPERIENCE_PARTICIPANTS,
} from "../../../../graphql";
import { theme } from "../../../../theme";
import {
  useWindowDimensions,
  IsEmailValid,
  isPhoneNumberValid,
} from "../../../../utils";

export default function ManageParticipant({ experienceBookingId }) {
  const { ModalContainer, isShow, show, hide } = useModal();
  const { width } = useWindowDimensions();
  const { addToast } = useToasts();
  const [activeParticipantId, setActiveParticipantId] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [form, setForm] = useState({
    email: {
      value: "",
      error: "",
    },
    phone: {
      value: "",
      error: "",
    },
    address: {
      value: null,
      error: "",
    },
  });
  const {
    loading: isParticipantsLoading,
    error: hasParticipantsError,
    data: { experienceBookingParticipants: participants = [] } = {},
  } = useSubscription(MANAGE_PARTICIPANTS, {
    variables: {
      experienceBookingId,
      paramsForParent: {
        shareFor: "parent",
      },
      paramsForChild: {
        shareFor: "child",
      },
    },
  });

  const [
    updateExperienceParticipant,
    { loading: isUpdatingParticipant },
  ] = useMutation(UPDATE_EXPERIENCE_PARTICIPANTS, {
    onError: (error) => {
      addToast("Somthing went wrong!", { appearance: "error" });
      console.log(error);
    },
  });
  const [updateCart, { loading: isUpdatingCart }] = useMutation(UPDATE_CART, {
    onCompleted: () => {
      addToast("Successfully updated participant!", { appearance: "success" });
      hide();
    },
    onError: (error) => {
      addToast("Somthing went wrong!", { appearance: "error" });
      console.log(error);
    },
  });
  const [
    deleteExperienceParticipant,
    { loading: isDeletingParticipant },
  ] = useMutation(DELETE_EXPERIENCE_PARTICIPANTS, {
    onError: (error) => {
      addToast("Somthing went wrong!", { appearance: "error" });
      console.log(error);
    },
  });
  const [deleteCart, { loading: isDeletingCart }] = useMutation(DELETE_CART, {
    onCompleted: () => {
      addToast("Participant Deleted!", { appearance: "success" });
    },
    onError: (error) => {
      addToast("Somthing went wrong!", { appearance: "error" });
      console.log(error);
    },
  });

  // toggle function for showing billing of participant
  const handleShowBilling = (participantId) => {
    if (activeParticipantId === participantId) {
      setActiveParticipantId(null);
    } else {
      setActiveParticipantId(participantId);
    }
  };

  // handler for onChange event on the form
  const onFormChangeHandler = (event, address) => {
    if (event === "address") {
      setForm((prev) => {
        return {
          ...prev,
          [event]: {
            value: address,
            error: "",
          },
        };
      });
    } else {
      const { name, value } = event.target;
      setForm((prev) => {
        return {
          ...prev,
          [name]: {
            value,
            error:
              name === "email"
                ? !IsEmailValid(value)
                  ? "Please provide a valid email"
                  : ""
                : !isPhoneNumberValid(value)
                ? "Please provide a valid phone"
                : "",
          },
        };
      });
    }
  };

  // handler for onClick event on the edit icon
  const onClickEdit = (participant) => {
    setSelectedParticipant(participant);
    show();
  };

  // mutation handler for updating the participant info
  const saveHandler = async () => {
    await updateExperienceParticipant({
      variables: {
        id: selectedParticipant?.id,
        _set: {
          email: form.email.value,
          phone: form.phone.value,
        },
      },
    });
    await updateCart({
      variables: {
        cartId: selectedParticipant?.cartId,
        _set: {
          address: form.address.value,
        },
      },
    });
  };

  // mutation handler for deleting the participant and their cart
  const deleteHandler = async (participant) => {
    setSelectedParticipant(participant);
    if (
      window.confirm(`Do you really want to remove ${participant?.email} ?`)
    ) {
      await deleteExperienceParticipant({
        variables: {
          id: participant?.id,
        },
      });
      await deleteCart({
        variables: {
          cartIds: [participant?.cartId],
        },
      });
    }
    setSelectedParticipant(null);
  };

  // initially setting the first participant as active participant for showing their billing
  useEffect(() => {
    if (participants.length) {
      setActiveParticipantId(participants[0]?.id);
    }
  }, [participants]);

  // prefill form with saved data of participant
  useEffect(() => {
    if (selectedParticipant) {
      setForm({
        email: {
          value: selectedParticipant?.email || "",
          error: "",
        },
        phone: {
          value: selectedParticipant?.phone || "",
          error: "",
        },
        address: {
          value: selectedParticipant?.childCart?.address || null,
          error: "",
        },
      });
    }
  }, [selectedParticipant]);

  // listing all the mutation and required field to set the isValid state for disabling the save button
  useEffect(() => {
    console.log("validity");
    if (
      !form.email.value ||
      !form.phone.value ||
      isUpdatingParticipant ||
      isUpdatingCart ||
      !isValid
    ) {
      console.log("validity2");
      setIsDisabled(true);
    } else {
      console.log("validity3");
      setIsDisabled(false);
    }
  }, [
    form.email.value,
    form.phone.value,
    isUpdatingCart,
    isUpdatingParticipant,
    isValid,
  ]);

  if (hasParticipantsError) {
    addToast("Somthing went wrong!", { appearance: "error" });
    console.error(hasParticipantsError);
  }
  if (isParticipantsLoading) return <InlineLoader />;
  return (
    <Wrapper>
      {participants.length > 0 ? (
        participants.map((participant, index) => {
          return (
            <div key={participant?.id}>
              <Flex
                container
                alignItems="flex-end"
                justifyContent="space-between"
              >
                <Flex
                  container
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <h3 className="participant-email">
                    <span style={{ marginRight: "4px" }}>{index + 1}.</span>
                    {participant?.email || "Unassigned user"}
                  </h3>
                  <span style={{ marginLeft: "8px" }}>
                    {participant?.rsvp ? (
                      <RsvpIcon size="40" color={theme.colors.textColor} />
                    ) : (
                      <NoRsvpIcon size="40" color={theme.colors.textColor} />
                    )}
                  </span>
                </Flex>
                <Flex container alignItems="center">
                  <span
                    className="billing-action"
                    onClick={() => handleShowBilling(participant?.id)}
                  >
                    See billing
                    {participant?.id === activeParticipantId ? (
                      <ChevronDown
                        size={theme.sizes.h6}
                        color={theme.colors.textColor}
                      />
                    ) : (
                      <ChevronRight
                        size={theme.sizes.h6}
                        color={theme.colors.textColor}
                      />
                    )}
                  </span>
                  <span
                    className="svg-edit-icon"
                    onClick={() => onClickEdit(participant)}
                  >
                    <IconButton
                      isLoading={isUpdatingParticipant || isUpdatingCart}
                      type="ghost"
                      size="sm"
                    >
                      <EditIcon size="16" color={theme.colors.textColor} />
                    </IconButton>
                  </span>

                  <span
                    className="svg-delete-icon"
                    onClick={() => deleteHandler(participant)}
                  >
                    <IconButton
                      isLoading={
                        participant?.id === selectedParticipant?.id &&
                        (isDeletingParticipant || isDeletingCart)
                      }
                      type="ghost"
                      size="sm"
                    >
                      <DeleteIcon
                        size="16"
                        color={theme.colors.tertiaryColor}
                      />
                    </IconButton>
                  </span>
                </Flex>
              </Flex>
              <div
                class={`billing-details ${
                  activeParticipantId === participant?.id ? "show" : "hidden"
                }`}
              >
                <table>
                  <tr>
                    <td>For</td>
                    <td>To Pay by Parent</td>
                    <td>To Pay by Child</td>
                  </tr>
                  <tr>
                    <td>Booking</td>
                    <td>
                      $
                      {participant?.childCart?.totalExperiencePriceForParent.toFixed(
                        2
                      )}
                    </td>
                    <td>
                      $
                      {participant?.childCart?.totalExperiencePriceForChild.toFixed(
                        2
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Kit ({participant?.childCart?.totalKit} {"* "}
                      {participant?.childCart?.itemTotalForParent /
                        participant?.childCart?.totalKit}
                      )
                    </td>
                    <td>
                      ${participant?.childCart?.itemTotalForParent.toFixed(2)}
                    </td>
                    <td>
                      ${participant?.childCart?.itemTotalForChild.toFixed(2)}
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          );
        })
      ) : (
        <h3>No participants yet</h3>
      )}
      <ModalContainer isShow={isShow}>
        <Modal
          isOpen={isShow}
          type={width > 769 ? "sideDrawer" : "bottomDrawer"}
          close={hide}
          showActionButton={true}
          actionButtonTitle="Save"
          actionHandler={saveHandler}
          disabledActionButton={isDisabled}
        >
          <ParticipantForm
            form={form}
            onChange={onFormChangeHandler}
            isValidFunc={(valid) => setIsValid(valid)}
            defaultAddress={selectedParticipant?.childCart?.address}
          />
        </Modal>
      </ModalContainer>
    </Wrapper>
  );
}