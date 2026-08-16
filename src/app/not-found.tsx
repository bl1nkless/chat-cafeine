import React from "react";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { CatMascot } from "@/components/mascot/CatMascot";

export default function NotFound() {
  return (
    <div className="py-24 sm:py-32">
      <Container size="narrow" className="text-center space-y-6">
        <CatMascot pose="peek" size="lg" className="mx-auto" />
        <span className="text-xs uppercase tracking-widest text-brown font-semibold font-sans">
          Erreur 404
        </span>
        <Heading as="h1" size="h1">
          Cette page s&apos;est envolée...
        </Heading>
        <Text variant="lead">
          Le chat est peut-être passé par là ! La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </Text>
        <div className="pt-4">
          <Button href="/" size="lg">
            Retour à l&apos;accueil
          </Button>
        </div>
      </Container>
    </div>
  );
}
