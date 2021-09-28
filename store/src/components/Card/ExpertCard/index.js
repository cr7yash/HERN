import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Flex } from "@dailykit/ui";
import { Card, CardImage, CardBody } from "./styles.js";

export default function ExpertCard({ cardDetails, ...props }) {
  const { expert, experienceCategoryTitle } = cardDetails;
  return (
    <Card {...props}>
      <CardImage>
        <Image
          src={
            expert?.assets?.images[0] ||
            `https://ui-avatars.com/api/?name=${expert?.firstName}+${expert?.lastName}&background=fff&color=15171F&size=500&rounded=true`
          }
          alt="Picture of the expert"
          layout="fill"
        />
        {/* <img src={expert?.assets?.images[0]} alt="card-img" /> */}
      </CardImage>
      <CardBody>
        <h2 className="exp-name">{`${expert?.firstName} ${expert?.lastName}`}</h2>
        <Flex container alignItems="center" flexDirection="column">
          <p className="category">{experienceCategoryTitle}</p>
          <p className="experience">
            {expert?.expertTotalExperience || 1} Experiences
          </p>
          <Link href={`/experts/${expert?.id}`}>
            <button className="viewProfileBtn">View Profile</button>
          </Link>
        </Flex>
      </CardBody>
    </Card>
  );
}
